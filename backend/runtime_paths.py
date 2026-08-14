"""Filesystem locations that work locally and in Vercel Functions."""

import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent

# A Vercel Function's deployment filesystem is read-only. Only /tmp is
# writable, and its contents are ephemeral (they can disappear between calls).
if os.getenv("VERCEL"):
    RUNTIME_DIR = Path("/tmp/crackwatch")
else:
    RUNTIME_DIR = BACKEND_DIR

UPLOAD_DIR = RUNTIME_DIR / "uploaded_images"
REPORT_DIR = RUNTIME_DIR / "generated_reports"
HEATMAP_DIR = RUNTIME_DIR / "gradcam" / "generated_heatmaps"


def ensure_runtime_directories() -> None:
    """Create directories used for temporary generated files."""

    for directory in (UPLOAD_DIR, REPORT_DIR, HEATMAP_DIR):
        directory.mkdir(parents=True, exist_ok=True)
