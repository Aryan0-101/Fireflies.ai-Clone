# Fireflies.ai Clone - Scaler Task

This is a full-stack meeting intelligence app built to match the current Fireflies.ai product UI. This project was developed as a task for **Scaler**.

## Links
- **Frontend Deployment**: [Insert Cloudflare URL here]
- **Backend API**: [Insert Render URL here]

## Stack

- Next.js 15 + React 19 + TypeScript
- FastAPI + SQLAlchemy 2 + SQLite + Alembic
- REST APIs for meetings, transcripts, summaries, action items, search, uploads, and TXT/Markdown/PDF exports

## Run

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. API docs: `http://localhost:8000/docs`.

## Features & UI Parity

- **Pixel-Perfect UI**: Fully refactored App Shell, Sidebars, and Home view to precisely match the latest Fireflies.ai styling (custom gradients, interactive micro-animations, and modern SVG iconography).
- **Responsive Layout**: Adapts gracefully across Desktop and Mobile form factors.
- **Full Backend Integration**: REST APIs for meetings, transcripts, summaries, action items, and TXT/Markdown/PDF exports.

## Routes

- `/` Home and quick start dashboard
- `/notebook/mine-shared` Meeting library, search, and transcript uploads
- `/meeting/[id]` Interactive transcript, playback controls, summary, action items, exports, and AskFred panel
- `/ask-fred` Standalone AskFred chat experience

## Verification

```powershell
cd backend
python -m pytest -q
cd ..
npm run build
python tools/verify_local.py
```