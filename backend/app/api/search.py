from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("")
def global_search(query: str = Query(min_length=1), db: Session = Depends(get_db)):
    return MeetingService(db).global_search(query)
