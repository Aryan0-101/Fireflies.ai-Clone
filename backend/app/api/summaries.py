from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.schemas import SummaryOut
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/api/summaries", tags=["summaries"])


@router.get("/{meeting_id}", response_model=SummaryOut)
def get_summary(meeting_id: int, db: Session = Depends(get_db)):
    summary = MeetingService(db).get(meeting_id).summary
    if not summary:
        raise NotFoundError("summary")
    return summary


@router.post("/generate/{meeting_id}", response_model=SummaryOut)
def generate(meeting_id: int, db: Session = Depends(get_db)):
    return MeetingService(db).regenerate_summary(meeting_id)
