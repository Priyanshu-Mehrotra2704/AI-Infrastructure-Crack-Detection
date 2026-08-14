"""Vercel entrypoint for the FastAPI backend.

The existing backend uses imports relative to its own directory because it is
also run directly by Docker/Uvicorn. Add that directory to the import path so
both deployment modes use the same FastAPI application.
"""

import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app  # noqa: E402, F401
