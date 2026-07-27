from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.export_service import as_markdown, as_pdf, as_text
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/api/exports", tags=["exports"])


@router.get("/txt/{meeting_id}")
def txt(meeting_id: int, db: Session = Depends(get_db)):
    meeting = MeetingService(db).get(meeting_id)
    return Response(
        as_text(meeting),
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="meeting-{meeting_id}.txt"'},
    )


@router.get("/md/{meeting_id}")
def markdown(meeting_id: int, db: Session = Depends(get_db)):
    meeting = MeetingService(db).get(meeting_id)
    return Response(
        as_markdown(meeting),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="meeting-{meeting_id}.md"'},
    )


@router.get("/pdf/{meeting_id}")
def pdf(meeting_id: int, db: Session = Depends(get_db)):
    meeting = MeetingService(db).get(meeting_id)
    return Response(
        as_pdf(meeting),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="meeting-{meeting_id}.pdf"'},
    )
