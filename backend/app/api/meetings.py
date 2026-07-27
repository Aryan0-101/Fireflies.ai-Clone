from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import MeetingCreate, MeetingDetail, MeetingUpdate, PaginatedMeetings
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.get("", response_model=PaginatedMeetings)
def list_meetings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    query: str | None = None,
    db: Session = Depends(get_db),
):
    items, total = MeetingService(db).list(page, page_size, query)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/{meeting_id}", response_model=MeetingDetail)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    return MeetingService(db).get(meeting_id)


@router.post("", response_model=MeetingDetail, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    meeting = MeetingService(db).create(payload)
    return MeetingService(db).get(meeting.id)


@router.put("/{meeting_id}", response_model=MeetingDetail)
def update_meeting(meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db)):
    return MeetingService(db).update(meeting_id, payload)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    MeetingService(db).delete(meeting_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
