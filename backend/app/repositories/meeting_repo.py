from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import Meeting


class MeetingRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_all(
        self, page: int = 1, page_size: int = 20, query: str | None = None
    ) -> tuple[list[Meeting], int]:
        stmt = select(Meeting).options(
            selectinload(Meeting.participants), selectinload(Meeting.topics)
        )
        count_stmt = select(func.count(Meeting.id))
        if query:
            predicate = or_(
                Meeting.title.ilike(f"%{query}%"),
                Meeting.description.ilike(f"%{query}%"),
            )
            stmt = stmt.where(predicate)
            count_stmt = count_stmt.where(predicate)
        stmt = (
            stmt.order_by(Meeting.meeting_date.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(self.db.scalars(stmt).unique()), self.db.scalar(count_stmt) or 0

    def find_by_id(self, meeting_id: int) -> Meeting | None:
        stmt = (
            select(Meeting)
            .where(Meeting.id == meeting_id)
            .options(
                selectinload(Meeting.participants),
                selectinload(Meeting.topics),
                selectinload(Meeting.transcript_segments),
                selectinload(Meeting.summary),
                selectinload(Meeting.action_items),
            )
        )
        return self.db.scalar(stmt)

    def create(self, meeting: Meeting) -> Meeting:
        self.db.add(meeting)
        self.db.commit()
        self.db.refresh(meeting)
        return meeting

    def delete(self, meeting: Meeting) -> None:
        self.db.delete(meeting)
        self.db.commit()
