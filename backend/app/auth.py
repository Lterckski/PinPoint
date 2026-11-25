"""Accounts and sessions for signing in to PinPoint (see docs/ARCHITECTURE.md, "Authentication").

PinPoint runs on one office machine, so accounts live next to the workspaces, in
backend/data/_auth/ (a name no workspace id can take). The first person to open PinPoint
creates the owner account; after that, the setup route is closed.

- Passwords: scrypt (N=2**15, r=8, p=1) with a 16-byte random salt, compared in constant time.
  Unknown emails still run one scrypt so response time doesn't reveal which emails exist.
- Sessions: a 256-bit random token in an HttpOnly cookie. Only its SHA-256 is stored, so a copy
  of sessions.json can't be replayed. A new token is issued on every sign-in and password change.
  Sessions end after SESSION_IDLE without use or SESSION_MAX in total.
- Sign-in throttling: after too many failures for one email from one address, or from one
  address overall, sign-in answers 429 until the window passes.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import tempfile
import threading
import time
import uuid
from pathlib import Path
from typing import Any

from . import storage

COOKIE_NAME = "pinpoint_session"
SESSION_MAX = 7 * 24 * 3600  # seconds; a session never outlives a week
SESSION_IDLE = 72 * 3600  # seconds without a request before a session ends

PASSWORD_MIN = 10
PASSWORD_MAX = 256
EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,189}\.[^@\s]{2,63}$")

_SCRYPT = {"n": 2**15, "r": 8, "p": 1}
_SCRYPT_MAXMEM = 64 * 1024 * 1024

# Throttling: failures within the window, keyed by (address, email) and by address alone.
THROTTLE_WINDOW = 15 * 60
THROTTLE_PER_ACCOUNT = 5
THROTTLE_PER_ADDRESS = 20
THROTTLE_MAX_KEYS = 10_000  # bounds memory when someone tries many different emails

_lock = threading.RLock()
_failures: dict[str, list[float]] = {}


class AuthError(Exception):
    """A request we refuse, with a message that is safe to show."""

    def __init__(self, message: str, status: int = 400, retry_after: int | None = None) -> None:
        super().__init__(message)
        self.status = status
        self.retry_after = retry_after


def enabled() -> bool:
    """PINPOINT_AUTH=off turns sign-in off (tests, a kiosk demo). It is on by default."""
    return os.getenv("PINPOINT_AUTH", "on").strip().lower() not in ("off", "0", "false", "no")


def remote_setup_allowed() -> bool:
    """The owner account is created from this computer only, unless PINPOINT_ALLOW_REMOTE_SETUP=1.

    Otherwise, if the server were reachable on a network before anyone set it up, the first
    stranger to open it could make themselves the owner.
    """
    return os.getenv("PINPOINT_ALLOW_REMOTE_SETUP", "").strip().lower() in ("1", "true", "yes", "on")


def cookie_secure() -> bool:
    """Set PINPOINT_COOKIE_SECURE=1 when PinPoint is served over HTTPS."""
    return os.getenv("PINPOINT_COOKIE_SECURE", "").strip().lower() in ("1", "true", "yes", "on")


# Storage


def _dir() -> Path:
    return storage.DATA_DIR / "_auth"


def _read(name: str, default: Any) -> Any:
    try:
        return json.loads((_dir() / name).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def _write(name: str, value: Any) -> None:
    path = _dir() / name
    path.parent.mkdir(parents=True, exist_ok=True)
    os.chmod(path.parent, 0o700)
    # mkstemp creates the file 0600, so credentials are never world-readable, even briefly.
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{name}.", suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(value, f, indent=1)
    os.replace(tmp, path)


def _users() -> list[dict[str, Any]]:
    return _read("users.json", [])


def _sessions() -> dict[str, dict[str, Any]]:
    return _read("sessions.json", {})


# Passwords


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, maxmem=_SCRYPT_MAXMEM, dklen=32, **_SCRYPT)
    b64 = lambda b: base64.b64encode(b).decode()  # noqa: E731
    return f"scrypt${_SCRYPT['n']}${_SCRYPT['r']}${_SCRYPT['p']}${b64(salt)}${b64(digest)}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, n, r, p, salt, expected = encoded.split("$")
        if scheme != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode(), salt=base64.b64decode(salt), n=int(n), r=int(r), p=int(p), maxmem=_SCRYPT_MAXMEM, dklen=32
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(digest, base64.b64decode(expected))


# Compared against when the email is unknown, so both paths cost one scrypt.
_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def _check_password_rules(password: str, email: str) -> None:
    if len(password) < PASSWORD_MIN:
        raise AuthError(f"Use at least {PASSWORD_MIN} characters.", 422)
    if len(password) > PASSWORD_MAX:
        raise AuthError(f"Use at most {PASSWORD_MAX} characters.", 422)
    if password.strip().lower() == email.strip().lower():
        raise AuthError("Your password can't be your email address.", 422)


def normalize_email(email: str) -> str:
    email = email.strip().lower()
    if len(email) > 254 or not EMAIL_RE.match(email):
        raise AuthError("Enter a valid email address.", 422)
    return email


def _clean_name(name: str) -> str:
    name = " ".join(name.split())
    if not 1 <= len(name) <= 80:
        raise AuthError("Enter your name (up to 80 characters).", 422)
    return name


def user_view(user: dict[str, Any]) -> dict[str, Any]:
    """What the browser may see about a user: never the password hash."""
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user.get("role", "member")}


# Accounts


def setup_required() -> bool:
    return not _users()


def create_owner(name: str, email: str, password: str) -> dict[str, Any]:
    """The first account. Refused once any account exists, so this can't add a second owner."""
    email = normalize_email(email)
    name = _clean_name(name)
    _check_password_rules(password, email)
    with _lock:
        if _users():
            raise AuthError("PinPoint is already set up. Sign in instead.", 409)
        user = {
            "id": uuid.uuid4().hex,
            "name": name,
            "email": email,
            "role": "owner",
            "password": hash_password(password),
            "created_at": storage.now_iso(),
        }
        _write("users.json", [user])
    return user


def authenticate(email: str, password: str, address: str) -> dict[str, Any]:
    """Return the user for a correct email and password, or raise one message for every failure."""
    key_email = email.strip().lower()[:254]
    _throttle(address, key_email)
    user = next((u for u in _users() if u["email"] == key_email), None)
    ok = verify_password(password[:PASSWORD_MAX], user["password"] if user else _DUMMY_HASH)
    if not (user and ok):
        _record_failure(address, key_email)
        raise AuthError("That email and password don't match.", 401)
    _clear_failures(address, key_email)
    return user


def update_profile(user_id: str, name: str) -> dict[str, Any]:
    name = _clean_name(name)
    with _lock:
        users = _users()
        user = next((u for u in users if u["id"] == user_id), None)
        if user is None:
            raise AuthError("Account not found.", 404)
        user["name"] = name
        _write("users.json", users)
    return user


def change_password(user_id: str, current: str, new: str) -> dict[str, Any]:
    with _lock:
        users = _users()
        user = next((u for u in users if u["id"] == user_id), None)
        if user is None or not verify_password(current[:PASSWORD_MAX], user["password"]):
            raise AuthError("Your current password is incorrect.", 403)
        _check_password_rules(new, user["email"])
        user["password"] = hash_password(new)
        user["password_changed_at"] = storage.now_iso()
        _write("users.json", users)
        # Every existing session ends; the caller starts a fresh one for this browser.
        revoke_all(user_id)
    return user


# Sessions


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def start_session(user_id: str, user_agent: str = "") -> str:
    token = secrets.token_urlsafe(32)
    now = time.time()
    with _lock:
        sessions = {k: s for k, s in _sessions().items() if _alive(s, now)}
        sessions[_hash_token(token)] = {
            "user_id": user_id,
            "created": now,
            "last_seen": now,
            "user_agent": user_agent[:200],
        }
        _write("sessions.json", sessions)
    return token


def _alive(session: dict[str, Any], now: float) -> bool:
    return now - session["created"] < SESSION_MAX and now - session["last_seen"] < SESSION_IDLE


def user_for_token(token: str | None) -> dict[str, Any] | None:
    """The signed-in user for a session cookie, or None. Refreshes last_seen at most once a minute."""
    if not token or len(token) > 128:
        return None
    key = _hash_token(token)
    now = time.time()
    with _lock:
        sessions = _sessions()
        session = sessions.get(key)
        if session is None:
            return None
        if not _alive(session, now):
            del sessions[key]
            _write("sessions.json", sessions)
            return None
        user = next((u for u in _users() if u["id"] == session["user_id"]), None)
        if user is None:
            del sessions[key]
            _write("sessions.json", sessions)
            return None
        if now - session["last_seen"] > 60:
            session["last_seen"] = now
            _write("sessions.json", sessions)
    return user


def end_session(token: str | None) -> None:
    if not token:
        return
    with _lock:
        sessions = _sessions()
        if sessions.pop(_hash_token(token), None) is not None:
            _write("sessions.json", sessions)


def revoke_all(user_id: str) -> None:
    with _lock:
        sessions = {k: s for k, s in _sessions().items() if s["user_id"] != user_id}
        _write("sessions.json", sessions)


def session_count(user_id: str) -> int:
    now = time.time()
    return sum(1 for s in _sessions().values() if s["user_id"] == user_id and _alive(s, now))


# Throttling


def _recent(key: str, now: float) -> list[float]:
    times = [t for t in _failures.get(key, []) if now - t < THROTTLE_WINDOW]
    if times:
        _failures[key] = times
    else:
        _failures.pop(key, None)
    return times


def _throttle(address: str, email: str) -> None:
    now = time.time()
    with _lock:
        for key, limit in ((f"{address}|{email}", THROTTLE_PER_ACCOUNT), (address, THROTTLE_PER_ADDRESS)):
            times = _recent(key, now)
            if len(times) >= limit:
                wait = int(THROTTLE_WINDOW - (now - times[0])) + 1
                minutes = max(1, round(wait / 60))
                raise AuthError(
                    f"Too many attempts. Try again in {minutes} minute{'s' if minutes != 1 else ''}.", 429, retry_after=wait
                )


def _record_failure(address: str, email: str) -> None:
    now = time.time()
    with _lock:
        if len(_failures) >= THROTTLE_MAX_KEYS:
            for key in list(_failures):
                _recent(key, now)  # drops keys whose failures are all outside the window
        if len(_failures) >= THROTTLE_MAX_KEYS:
            # Still full: forget per-email keys first; per-address limits keep holding.
            for key in [k for k in _failures if "|" in k][: THROTTLE_MAX_KEYS // 2]:
                del _failures[key]
        for key in (f"{address}|{email}", address):
            _failures.setdefault(key, []).append(now)


def _clear_failures(address: str, email: str) -> None:
    with _lock:
        _failures.pop(f"{address}|{email}", None)


def reset_throttle() -> None:
    """Tests only."""
    with _lock:
        _failures.clear()
