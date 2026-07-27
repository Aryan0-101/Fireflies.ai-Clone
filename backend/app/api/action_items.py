from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.models import ActionItem
from app.schemas import ActionItemCreate, ActionItemOut, ActionItemUpdate
from app.services.meeting_service import MeetingService

router = APIRouter(prefix="/api/action-items", tags=["action-items"])


@router.get("/{meeting_id}", response_model=list[ActionItemOut])
def list_items(meeting_id: int, db: Session = Depends(get_db)):
    return MeetingService(db).get(meeting_id).action_items


@router.post("", response_model=ActionItemOut, status_code=status.HTTP_201_CREATED)
def create_item(payload: ActionItemCreate, db: Session = Depends(get_db)):
    MeetingService(db).get(payload.meeting_id)
    item = ActionItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ActionItemOut)
def update_item(item_id: int, payload: ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.get(ActionItem, item_id)
    if not item:
        raise NotFoundError("action_item")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(ActionItem, item_id)
    if not item:
        raise NotFoundError("action_item")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
