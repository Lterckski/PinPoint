"""Sign-in: first-run setup, sign-in, sessions, CSRF, throttling, password change, and that every
workspace route needs a session. Also checks upload types and how originals are served.
No MinerU or network.

  cd backend && .venv/bin/python tests/test_auth.py
"""

import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.environ["PINPOINT_DATA_DIR"] = tempfile.mkdtemp(prefix="pinpoint-test-")
os.environ["EMBED_BASE"] = ""
os.environ["LLM_PROVIDER"] = "none"
os.environ.pop("PINPOINT_AUTH", None)
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from app import auth, main, storage  # noqa: E402

CSRF = {"X-PinPoint-CSRF": "1"}
ORIGIN = {"Origin": "http://localhost:5173"}
PASSWORD = "correct horse battery"


def check(label: str, condition: bool) -> None:
    print(f"{'PASS' if condition else 'FAIL'}  {label}")
    if not condition:
        sys.exit(1)


with TestClient(main.app, base_url="http://localhost:8000") as c:
    # Signed out
    r = c.get("/api/auth/session")
    check("session: signed out, setup required", r.status_code == 200 and r.json()["user"] is None and r.json()["setup_required"])
    check("health: signed out shows only ok", c.get("/api/health").json() == {"ok": True})
    for method, path in [
        ("GET", "/api/workspaces"),
        ("GET", "/api/workspaces/reyes-partners/files"),
        ("GET", "/api/workspaces/reyes-partners/history"),
        ("GET", "/api/crops/abc.png"),
        ("GET", "/api/auth/me"),
        ("POST", "/api/workspaces"),
        ("POST", "/api/workspaces/reyes-partners/ask"),
        ("DELETE", "/api/workspaces/reyes-partners"),
    ]:
        r = c.request(method, path, headers=CSRF, json={})
        check(f"{method} {path} signed out -> 401", r.status_code == 401)

    # CSRF: state-changing requests need the header and an allowed Origin
    r = c.post("/api/auth/setup", json={"name": "Ana", "email": "ana@reyes.ph", "password": PASSWORD})
    check("setup without CSRF header -> 403", r.status_code == 403)
    r = c.post(
        "/api/auth/setup",
        json={"name": "Ana", "email": "ana@reyes.ph", "password": PASSWORD},
        headers={**CSRF, "Origin": "https://evil.example"},
    )
    check("setup from another origin -> 403", r.status_code == 403)
    check("no account was created by blocked requests", auth.setup_required())

    # Setup rules
    r = c.post("/api/auth/setup", json={"name": "Ana", "email": "ana@reyes.ph", "password": "short"}, headers={**CSRF, **ORIGIN})
    check("setup: short password -> 422", r.status_code == 422)
    r = c.post("/api/auth/setup", json={"name": "Ana", "email": "not-an-email", "password": PASSWORD}, headers=CSRF)
    check("setup: bad email -> 422", r.status_code == 422)

    r = c.post("/api/auth/setup", json={"name": " Ana  Reyes ", "email": "Ana@Reyes.ph", "password": PASSWORD}, headers={**CSRF, **ORIGIN})
    check("setup: creates owner and signs in", r.status_code == 200 and r.json()["user"]["email"] == "ana@reyes.ph")
    check("setup: name is tidied", r.json()["user"]["name"] == "Ana Reyes")
    cookie = r.headers.get("set-cookie", "")
    check("cookie is HttpOnly and SameSite=Lax", "httponly" in cookie.lower() and "samesite=lax" in cookie.lower())
    check("response never includes the password hash", "scrypt" not in r.text and "password" not in r.json()["user"])
    first_token = c.cookies.get(auth.COOKIE_NAME)

    users = json.loads((storage.DATA_DIR / "_auth" / "users.json").read_text())
    check("password stored as scrypt hash", users[0]["password"].startswith("scrypt$") and PASSWORD not in json.dumps(users))
    sessions = json.loads((storage.DATA_DIR / "_auth" / "sessions.json").read_text())
    check("session token is stored hashed", first_token not in json.dumps(sessions))
    check("auth files are private (0600)", oct((storage.DATA_DIR / "_auth" / "users.json").stat().st_mode & 0o777) == "0o600")

    r = c.post("/api/auth/setup", json={"name": "Eve", "email": "eve@x.ph", "password": PASSWORD}, headers=CSRF)
    check("setup: refused once an account exists", r.status_code == 409)

    # Signed in
    check("workspaces reachable when signed in", c.get("/api/workspaces").status_code == 200)
    check("health: full details when signed in", "llm" in c.get("/api/health").json())
    me = c.get("/api/auth/me").json()
    check("me: one session", me["sessions"] == 1)
    r = c.post("/api/workspaces", json={"name": "Santos", "industry": "Law office"})
    check("POST without CSRF header blocked even when signed in", r.status_code == 403)

    # Headers
    r = c.get("/api/workspaces")
    check("API responses are not cached", r.headers.get("cache-control") == "private, no-store")
    check("nosniff header", r.headers.get("x-content-type-options") == "nosniff")

    # Uploads: unsupported types refused, originals served safely
    r = c.post(
        "/api/workspaces/reyes-partners/files",
        files=[("files", ("evil.html", b"<script>alert(1)</script>", "text/html"))],
        headers=CSRF,
    )
    check("upload: .html refused (415)", r.status_code == 415)
    r = c.post(
        "/api/workspaces/reyes-partners/files",
        files=[("files", ("notes.md", b"# Notes\n\nHello", "text/markdown"))],
        headers=CSRF,
    )
    check("upload: .md accepted", r.status_code == 200)
    file_id = r.json()[0]["id"]
    r = c.get(f"/api/workspaces/reyes-partners/files/{file_id}/raw")
    check("raw .md served as text/plain", r.headers["content-type"].startswith("text/plain"))
    check("raw file sandboxed by CSP", "sandbox" in r.headers.get("content-security-policy", ""))

    # Profile
    r = c.patch("/api/auth/me", json={"name": "Ana R."}, headers=CSRF)
    check("profile: name updated", r.status_code == 200 and r.json()["name"] == "Ana R.")

    # Sign out ends the session server-side
    c.post("/api/auth/logout", headers=CSRF)
    check("logout clears session", c.get("/api/auth/session").json()["user"] is None)
    c.cookies.set(auth.COOKIE_NAME, first_token)
    check("old token no longer works after logout", c.get("/api/workspaces").status_code == 401)
    c.cookies.clear()

    # Sign in
    r = c.post("/api/auth/login", json={"email": "ana@reyes.ph", "password": "wrong password!"}, headers=CSRF)
    check("login: wrong password -> 401", r.status_code == 401)
    msg_wrong = r.json()["detail"]
    r = c.post("/api/auth/login", json={"email": "nobody@reyes.ph", "password": "wrong password!"}, headers=CSRF)
    check("login: unknown email gets the same message", r.status_code == 401 and r.json()["detail"] == msg_wrong)
    r = c.post("/api/auth/login", json={"email": " ANA@reyes.ph ", "password": PASSWORD}, headers=CSRF)
    check("login: email is case- and space-insensitive", r.status_code == 200)
    token_a = c.cookies.get(auth.COOKIE_NAME)
    check("login: a fresh token each time", token_a and token_a != first_token)

    # A second device
    with TestClient(main.app, base_url="http://localhost:8000") as other:
        other.post("/api/auth/login", json={"email": "ana@reyes.ph", "password": PASSWORD}, headers=CSRF)
        check("second device signed in", other.get("/api/workspaces").status_code == 200)

        # Password change ends every other session
        r = c.post("/api/auth/password", json={"current_password": "nope nope nope", "new_password": "another long one"}, headers=CSRF)
        check("password: wrong current -> 403", r.status_code == 403)
        r = c.post("/api/auth/password", json={"current_password": PASSWORD, "new_password": "short"}, headers=CSRF)
        check("password: too short -> 422", r.status_code == 422)
        r = c.post("/api/auth/password", json={"current_password": PASSWORD, "new_password": "a brand new passphrase"}, headers=CSRF)
        check("password: changed", r.status_code == 200)
        check("password: this browser stays signed in", c.get("/api/workspaces").status_code == 200)
        check("password: other device signed out", other.get("/api/workspaces").status_code == 401)

    # Sign out everywhere
    r = c.post("/api/auth/logout-all", headers=CSRF)
    check("logout-all ok", r.status_code == 200)
    check("logout-all signs this browser out too", c.get("/api/workspaces").status_code == 401)

    # Throttling
    auth.reset_throttle()
    codes = [
        c.post("/api/auth/login", json={"email": "ana@reyes.ph", "password": f"guess number {i}"}, headers=CSRF).status_code
        for i in range(6)
    ]
    check("throttle: 5 failures then 429", codes == [401] * 5 + [429])
    r = c.post("/api/auth/login", json={"email": "ana@reyes.ph", "password": "a brand new passphrase"}, headers=CSRF)
    check("throttle: even the right password waits", r.status_code == 429 and "retry-after" in r.headers)
    auth.reset_throttle()
    r = c.post("/api/auth/login", json={"email": "ana@reyes.ph", "password": "a brand new passphrase"}, headers=CSRF)
    check("throttle: works again after the window", r.status_code == 200)

    # Tampered and oversized tokens
    c.cookies.clear()
    c.cookies.set(auth.COOKIE_NAME, "x" * 500)
    check("oversized token rejected", c.get("/api/workspaces").status_code == 401)

# Expiry
token = auth.start_session(users[0]["id"])
check("fresh session valid", auth.user_for_token(token) is not None)
data = json.loads((storage.DATA_DIR / "_auth" / "sessions.json").read_text())
for s in data.values():
    s["last_seen"] -= auth.SESSION_IDLE + 1
(storage.DATA_DIR / "_auth" / "sessions.json").write_text(json.dumps(data))
check("idle session expires", auth.user_for_token(token) is None)

print("All auth checks passed.")
