"""Optional FastAPI presentation layer for the local portfolio demo."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .demo import build_demo_report


PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIR = PROJECT_ROOT / "frontend"

app = FastAPI(title="CTA Strategy Research Showcase", version="0.1.0")
app.mount("/assets", StaticFiles(directory=FRONTEND_DIR), name="assets")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "data_boundary": "synthetic-only"}


@app.get("/api/demo")
def demo_report() -> dict[str, object]:
    return build_demo_report()


@app.get("/")
def index() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


def main() -> None:
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)

