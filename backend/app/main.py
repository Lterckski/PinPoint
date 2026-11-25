import logging
import os
import threading
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from . import answer, auth, crops, folders, llm, parsing, picker, search, storage

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
# The types PinPoint can read (the same list as the frontend's SUPPORTED_EXTENSIONS and folders.SUPPORTED).
UPLOAD_EXTENSIONS = folders.SUPPORTED
# Originals the browser may display inline. Anything else is sent as a download.
INLINE_TYPES = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "txt": "text/plain; charset=utf-8",
    "md": "text/plain; charset=utf-8",
    "csv": "text/plain; charset=utf-8",
}

# Browser origins allowed to call the API with the session cookie (the Vite dev server by default).
ALLOWED_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("PINPOINT_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if o.strip()
]
# Sent by the frontend on every state-changing request. A cross-site page can't add a custom
# header without a CORS preflight, which only ALLOWED_ORIGINS pass, so this blocks CSRF.
CSRF_HEADER = "x-pinpoint-csrf"
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
# Reachable without signing in.
PUBLIC_PATHS = {"/api/health", "/api/auth/session", "/api/auth/login", "/api/auth/setup"}

# Our own log lines (tier choice, parse times, embedding failures) next to uvicorn's.
_handler = logging.StreamHandler()
_handler.setFormatter(logging.Formatter("%(levelname)s:     %(name)s: %(message)s"))
logging.getLogger("pinpoint").addHandler(_handler)
logging.getLogger("pinpoint").setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Persistent knowledge base: everything is reloaded from backend/data on startup.
    storage.seed_demo_workspace()
    for ws in storage.workspace_ids():
        search.rebuild(ws)
        parsing.resume_interrupted(ws)
        folders.resume(ws)
    parsing.start_watchdog()
    # Fill in any missing vectors without delaying startup.
    threading.Thread(target=lambda: [search.index_vectors(ws) for ws in storage.workspace_ids()], daemon=True).start()
    yield


app = FastAPI(title="PinPoint API", lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
log = logging.getLogger("pinpoint")
if not auth.enabled():
    log.warning("PINPOINT_AUTH=off: anyone who can reach this server can read every workspace.")


def _client_address(request: Request) -> str:
    # The direct peer only: X-Forwarded-For is client-controlled unless a trusted proxy sets it.
    return request.client.host if request.client else "unknown"


class GuardMiddleware(BaseHTTPMiddleware):
    """CSRF check, sign-in check, and security headers for every /api route.

    Done here rather than per route so no route (now or later) can forget it.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        if path.startswith("/api/") and request.method != "OPTIONS":
            if request.method in UNSAFE_METHODS:
                origin = (request.headers.get("origin") or "").rstrip("/")
                if request.headers.get(CSRF_HEADER) != "1" or (origin and origin not in ALLOWED_ORIGINS):
                    return _secure(JSONResponse(status_code=403, content={"detail": "Request blocked: it didn't come from PinPoint."}), path)
            request.state.user = None
            if auth.enabled():
                request.state.user = auth.user_for_token(request.cookies.get(auth.COOKIE_NAME))
                if request.state.user is None and path not in PUBLIC_PATHS:
                    return _secure(JSONResponse(status_code=401, content={"detail": "Sign in to continue."}), path)
        response = await call_next(request)
        return _secure(response, path) if path.startswith("/api/") else response


def _secure(response: Response, path: str) -> Response:
    h = response.headers
    h.setdefault("X-Content-Type-Options", "nosniff")
    h.setdefault("Referrer-Policy", "no-referrer")
    h.setdefault("X-Frame-Options", "DENY")
    h.setdefault("Cross-Origin-Resource-Policy", "same-site")
    # Client documents are confidential: never store API responses in shared or disk caches.
    h.setdefault("Cache-Control", "private, no-store")
    if "content-security-policy" not in h:
        h["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    return response


app.add_middleware(GuardMiddleware)
# Added last, so it runs first and its headers reach 401/403 answers too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-PinPoint-CSRF"],
)


class CreateWorkspace(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    industry: str = Field(min_length=1, max_length=60)


class CreateNote(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class ConnectFolder(BaseModel):
    path: str = Field(min_length=1, max_length=1024)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    thread_id: str | None = Field(default=None, max_length=64)
    file_ids: list[str] | None = Field(default=None, max_length=50)


class SaveHistory(BaseModel):
    saved: bool


def _require_workspace(ws: str) -> None:
    try:
        storage.workspace_view(ws)
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Workspace not found") from None


# Authentication (docs/ARCHITECTURE.md, "Authentication")


class SetupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=auth.PASSWORD_MAX)


class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=auth.PASSWORD_MAX)


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=auth.PASSWORD_MAX)
    new_password: str = Field(min_length=1, max_length=auth.PASSWORD_MAX)


def _auth_error(e: auth.AuthError) -> JSONResponse:
    headers = {"Retry-After": str(e.retry_after)} if e.retry_after else None
    return JSONResponse(status_code=e.status, content={"detail": str(e)}, headers=headers)


def _signed_in(response: Response, request: Request, user: dict[str, Any]) -> dict[str, Any]:
    """Start a fresh session (never reuse one from before sign-in) and set its cookie."""
    auth.end_session(request.cookies.get(auth.COOKIE_NAME))
    token = auth.start_session(user["id"], request.headers.get("user-agent", ""))
    response.set_cookie(
        auth.COOKIE_NAME,
        token,
        max_age=auth.SESSION_MAX,
        httponly=True,
        secure=auth.cookie_secure(),
        samesite="lax",
        path="/",
    )
    return {"user": auth.user_view(user), "setup_required": False, "auth_enabled": True}


def _current_user(request: Request) -> dict[str, Any]:
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    return user


@app.get("/api/auth/session")
def auth_session(request: Request) -> dict[str, Any]:
    """Who is signed in, and whether PinPoint still needs its first account."""
    if not auth.enabled():
        local = {"id": "local", "name": "Local user", "email": "", "role": "owner"}
        return {"user": local, "setup_required": False, "auth_enabled": False}
    user = request.state.user
    return {
        "user": auth.user_view(user) if user else None,
        "setup_required": auth.setup_required(),
        "auth_enabled": True,
    }


@app.post("/api/auth/setup", response_model=None)
def auth_setup(body: SetupRequest, request: Request, response: Response) -> dict[str, Any] | JSONResponse:
    """Create the owner account. Only works while no account exists."""
    if not auth.enabled():
        return JSONResponse(status_code=404, content={"detail": "Sign-in is turned off on this server."})
    if _client_address(request) not in ("127.0.0.1", "::1") and not auth.remote_setup_allowed():
        return JSONResponse(status_code=403, content={"detail": "Set up PinPoint from the computer it runs on."})
    try:
        user = auth.create_owner(body.name, body.email, body.password)
    except auth.AuthError as e:
        return _auth_error(e)
    return _signed_in(response, request, user)


@app.post("/api/auth/login", response_model=None)
def auth_login(body: LoginRequest, request: Request, response: Response) -> dict[str, Any] | JSONResponse:
    if not auth.enabled():
        return JSONResponse(status_code=404, content={"detail": "Sign-in is turned off on this server."})
    try:
        user = auth.authenticate(body.email, body.password, _client_address(request))
    except auth.AuthError as e:
        return _auth_error(e)
    return _signed_in(response, request, user)


@app.post("/api/auth/logout")
def auth_logout(request: Request, response: Response) -> dict[str, bool]:
    auth.end_session(request.cookies.get(auth.COOKIE_NAME))
    response.delete_cookie(auth.COOKIE_NAME, path="/", httponly=True, secure=auth.cookie_secure(), samesite="lax")
    return {"ok": True}


@app.post("/api/auth/logout-all")
def auth_logout_all(request: Request, response: Response) -> dict[str, bool]:
    """Sign out on every device, this one included."""
    auth.revoke_all(_current_user(request)["id"])
    response.delete_cookie(auth.COOKIE_NAME, path="/", httponly=True, secure=auth.cookie_secure(), samesite="lax")
    return {"ok": True}


@app.get("/api/auth/me")
def auth_me(request: Request) -> dict[str, Any]:
    user = _current_user(request)
    return {**auth.user_view(user), "sessions": auth.session_count(user["id"])}


@app.patch("/api/auth/me", response_model=None)
def auth_update_me(body: ProfileUpdate, request: Request) -> dict[str, Any] | JSONResponse:
    try:
        return auth.user_view(auth.update_profile(_current_user(request)["id"], body.name))
    except auth.AuthError as e:
        return _auth_error(e)


@app.post("/api/auth/password", response_model=None)
def auth_password(body: PasswordChange, request: Request, response: Response) -> dict[str, Any] | JSONResponse:
    """Change the password. Every other session ends; this browser gets a new one."""
    try:
        user = auth.change_password(_current_user(request)["id"], body.current_password, body.new_password)
    except auth.AuthError as e:
        return _auth_error(e)
    return _signed_in(response, request, user)


@app.get("/api/health")
def health(request: Request) -> dict[str, Any]:
    # Signed out, say only that the server is up: model names and errors are for signed-in users.
    if auth.enabled() and request.state.user is None:
        return {"ok": True}
    status = llm.health()
    return {
        "ok": True,
        "llm": {k: status.get(k) for k in ("ok", "provider", "model", "mode", "latency_ms", "error")},
        "embeddings": llm.embed_health(),
        "mineru": parsing.server_status(),
    }


@app.post("/api/system/pick-folder", response_model=None)
def pick_folder(request: Request) -> dict[str, str | None] | JSONResponse:
    """Open the OS folder picker and return the chosen path (null if cancelled).

    Localhost only. It does not connect the folder; POST /folders validates the path.
    """
    if request.client is None or request.client.host not in ("127.0.0.1", "::1"):
        return JSONResponse(status_code=403, content={"error": "The folder picker is only available on this computer."})
    try:
        return {"path": picker.pick_folder()}
    except picker.PickerUnavailable:
        return JSONResponse(status_code=501, content={"error": "Folder picker not available; type the path instead."})


@app.get("/api/workspaces")
def list_workspaces() -> list[dict[str, Any]]:
    return storage.list_workspaces()


@app.post("/api/workspaces")
def create_workspace(body: CreateWorkspace) -> dict[str, Any]:
    return storage.create_workspace(body.name.strip(), body.industry.strip())


@app.delete("/api/workspaces/{ws}")
def delete_workspace(ws: str) -> dict[str, bool]:
    """Delete a workspace and all of its data in backend/data. Parsing is cancelled first."""
    _require_workspace(ws)
    for record in storage.list_file_records(ws):
        if record["status"] in ("queued", "parsing"):
            parsing.cancel(ws, record["id"])
    try:
        storage.delete_workspace(ws)
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Workspace not found") from None
    search.forget(ws)
    answer.forget(ws)
    return {"ok": True}


@app.get("/api/workspaces/{ws}/files")
def list_files(ws: str) -> list[dict[str, Any]]:
    _require_workspace(ws)
    return storage.list_files(ws)


@app.post("/api/workspaces/{ws}/files")
async def upload_files(ws: str, files: list[UploadFile] = File(...)) -> list[dict[str, Any]]:
    _require_workspace(ws)
    added = []
    for upload in files:
        name = upload.filename or "file"
        if "." not in name or name.rsplit(".", 1)[-1].lower() not in UPLOAD_EXTENSIONS:
            raise HTTPException(status_code=415, detail=f"{name} isn't a supported file type")
    for upload in files:
        data = await upload.read(MAX_UPLOAD_BYTES + 1)
        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail=f"{upload.filename} is larger than 50 MB")
        record = storage.add_upload(ws, upload.filename or "file", data)
        parsing.enqueue(ws, record["id"])
        added.append(storage.file_view(record))
    return added


@app.delete("/api/workspaces/{ws}/files/{file_id}")
def delete_file(ws: str, file_id: str) -> dict[str, bool]:
    """Delete an uploaded file; one that is queued or being read is cancelled first."""
    _require_workspace(ws)
    record = next((r for r in storage.list_file_records(ws) if r["id"] == file_id), None)
    if record and record.get("source") != "folder" and record["status"] in ("queued", "parsing"):
        parsing.cancel(ws, file_id)
    try:
        storage.delete_file(ws, file_id)
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="File not found") from None
    except storage.CannotDelete as e:
        raise HTTPException(status_code=409, detail=str(e)) from None
    search.rebuild(ws)
    storage.touch_workspace(ws)
    return {"ok": True}


@app.get("/api/workspaces/{ws}/files/{file_id}/raw")
def raw_file(ws: str, file_id: str) -> FileResponse:
    """The original document, inline. Registered files only; never a path from the URL."""
    _require_workspace(ws)
    path = storage.original_path(ws, file_id)
    if path is None:
        raise HTTPException(status_code=404, detail="File not found")
    name = next(r["name"] for r in storage.list_file_records(ws) if r["id"] == file_id)
    # Only known-safe types display inline; anything else (e.g. a connected folder's .docx)
    # downloads, so a crafted file can never run as a page on the API's origin.
    inline = INLINE_TYPES.get(name.rsplit(".", 1)[-1].lower() if "." in name else "")
    response = FileResponse(
        path,
        media_type=inline or "application/octet-stream",
        filename=name,
        content_disposition_type="inline" if inline else "attachment",
    )
    response.headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox"
    return response


@app.get("/api/workspaces/{ws}/files/{file_id}/pages/{page}.png")
def page_png(ws: str, file_id: str, page: int) -> FileResponse:
    """A PDF page rendered as an image (registered files only, by id; 404 otherwise)."""
    _require_workspace(ws)
    locator = storage.page_locator(ws, file_id, page)
    path = crops.page_image(ws, locator) if locator else None
    if path is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return FileResponse(path, media_type="image/png")


@app.get("/api/workspaces/{ws}/files/{file_id}/text")
def file_text(ws: str, file_id: str) -> dict[str, Any]:
    _require_workspace(ws)
    text = storage.file_text(ws, file_id)
    if text is None:
        raise HTTPException(status_code=404, detail="File not found")
    return text


@app.post("/api/workspaces/{ws}/ask")
def ask(ws: str, body: AskRequest) -> dict[str, Any]:
    _require_workspace(ws)
    return answer.ask(ws, body.question.strip(), body.thread_id, body.file_ids)


@app.get("/api/workspaces/{ws}/history")
def list_history(ws: str) -> list[dict[str, Any]]:
    _require_workspace(ws)
    return [storage.history_item(r) for r in reversed(storage.list_history_records(ws))]


@app.get("/api/workspaces/{ws}/history/{history_id}")
def get_history(ws: str, history_id: str) -> dict[str, Any]:
    _require_workspace(ws)
    try:
        return storage.history_detail(storage.get_history(ws, history_id))
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Not found in history") from None


@app.patch("/api/workspaces/{ws}/history/{history_id}")
def save_history(ws: str, history_id: str, body: SaveHistory) -> dict[str, Any]:
    _require_workspace(ws)
    try:
        return storage.history_item(storage.set_history_saved(ws, history_id, body.saved))
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Not found in history") from None


@app.get("/api/workspaces/{ws}/knowledge")
def knowledge(ws: str) -> dict[str, Any]:
    _require_workspace(ws)
    return storage.knowledge_stats(ws)


@app.get("/api/workspaces/{ws}/notes")
def list_notes(ws: str) -> list[dict[str, Any]]:
    _require_workspace(ws)
    return storage.list_notes(ws)


@app.post("/api/workspaces/{ws}/notes")
def create_note(ws: str, body: CreateNote) -> dict[str, Any]:
    _require_workspace(ws)
    note = storage.add_note(ws, body.text)
    search.rebuild(ws)
    search.index_vectors(ws)
    return note


@app.delete("/api/workspaces/{ws}/notes/{note_id}")
def delete_note(ws: str, note_id: str) -> dict[str, bool]:
    _require_workspace(ws)
    try:
        storage.delete_note(ws, note_id)
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Note not found") from None
    search.rebuild(ws)
    return {"ok": True}


@app.get("/api/workspaces/{ws}/folders")
def list_folders(ws: str) -> list[dict[str, Any]]:
    _require_workspace(ws)
    return [storage.folder_view(ws, f) for f in storage.list_folder_records(ws)]


@app.post("/api/workspaces/{ws}/folders")
def connect_folder(ws: str, body: ConnectFolder) -> dict[str, Any]:
    _require_workspace(ws)
    try:
        return folders.connect(ws, body.path)
    except folders.FolderError as e:
        raise HTTPException(status_code=400, detail=str(e)) from None


@app.post("/api/workspaces/{ws}/folders/{folder_id}/rescan")
def rescan_folder(ws: str, folder_id: str) -> dict[str, Any]:
    _require_workspace(ws)
    try:
        return folders.rescan(ws, folder_id)
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Folder not found") from None


@app.delete("/api/workspaces/{ws}/folders/{folder_id}")
def disconnect_folder(ws: str, folder_id: str) -> dict[str, bool]:
    _require_workspace(ws)
    try:
        folders.disconnect(ws, folder_id)
    except storage.NotFound:
        raise HTTPException(status_code=404, detail="Folder not found") from None
    return {"ok": True}


@app.get("/api/crops/{crop_id}.png")
def get_crop(crop_id: str) -> FileResponse:
    path = crops.crop_path(crop_id)
    if path is None or not path.exists():
        raise HTTPException(status_code=404, detail="Crop not found")
    return FileResponse(path, media_type="image/png")
