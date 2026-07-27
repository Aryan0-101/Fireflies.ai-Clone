from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATABASE_URL = f"sqlite:///{ROOT / 'fireflies.db'}"
UPLOAD_DIR = ROOT / "uploads"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
