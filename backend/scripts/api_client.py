"""An httpx client for the PinPoint API that scripts share.

It sends the CSRF header every state-changing request needs and, when sign-in is on, signs in
with PINPOINT_EMAIL and PINPOINT_PASSWORD from the environment (never from the command line,
so the password stays out of shell history and the process list).
"""

import os
import sys

import httpx


def api_client(api: str) -> httpx.Client:
    client = httpx.Client(base_url=api.rstrip("/"), timeout=120, headers={"X-PinPoint-CSRF": "1"})
    try:
        session = client.get("/api/auth/session").json()
    except (httpx.HTTPError, ValueError):
        return client  # The caller reports the unreachable server.
    if session.get("user"):
        return client
    email, password = os.getenv("PINPOINT_EMAIL"), os.getenv("PINPOINT_PASSWORD")
    if not (email and password):
        sys.exit("Sign-in is on. Set PINPOINT_EMAIL and PINPOINT_PASSWORD in the environment, then run this again.")
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    if r.status_code != 200:
        sys.exit(f"Sign-in failed ({r.status_code}): {r.json().get('detail', '')}")
    return client
