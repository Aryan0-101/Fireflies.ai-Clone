from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import delete, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import NotFoundError
from app.models import ActionItem, Meeting, Participant, Summary, Topic, TranscriptSegment
from app.repositories.meeting_repo import MeetingRepository
from app.schemas import MeetingCreate, MeetingUpdate
from app.services.ai_service import generate_summary


class MeetingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MeetingRepository(db)

    def list(self, page: int, page_size: int, query: str | None):
        return self.repo.find_all(page, page_size, query)

    def get(self, meeting_id: int) -> Meeting:
        meeting = self.repo.find_by_id(meeting_id)
        if not meeting:
            raise NotFoundError("meeting")
        return meeting

    def create(self, payload: MeetingCreate) -> Meeting:
        meeting = Meeting(
            title=payload.title,
            description=payload.description,
            meeting_date=payload.meeting_date,
            duration_seconds=payload.duration_seconds,
        )
        for email in payload.participants:
            participant = self.db.scalar(select(Participant).where(Participant.email == email))
            if not participant:
                participant = Participant(name=email.split("@")[0].replace(".", " ").title(), email=email)
            meeting.participants.append(participant)
        return self.repo.create(meeting)

    def update(self, meeting_id: int, payload: MeetingUpdate) -> Meeting:
        meeting = self.get(meeting_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(meeting, field, value)
        meeting.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        return self.get(meeting_id)

    def delete(self, meeting_id: int) -> None:
        self.repo.delete(self.get(meeting_id))

    def attach_transcript(self, meeting_id: int, segments: list[dict]) -> Meeting:
        meeting = self.get(meeting_id)
        meeting.transcript_segments.clear()
        meeting.transcript_segments.extend(TranscriptSegment(**segment) for segment in segments)
        meeting.duration_seconds = max(segment["end_time"] for segment in segments)
        meeting.status = "transcribed"
        self.db.commit()
        return self.get(meeting_id)

    def regenerate_summary(self, meeting_id: int) -> Summary:
        meeting = self.get(meeting_id)
        result = generate_summary(meeting.transcript_segments)
        if meeting.summary:
            meeting.summary.summary = result["summary"]
            meeting.summary.outline = result["outline"]
        else:
            meeting.summary = Summary(
                summary=result["summary"], outline=result["outline"]
            )
        self.db.execute(delete(Topic).where(Topic.meeting_id == meeting.id))
        for topic in result["topics"]:
            meeting.topics.append(Topic(topic=topic))
        if not meeting.action_items:
            for item in result["action_items"]:
                meeting.action_items.append(ActionItem(**item))
        self.db.commit()
        return meeting.summary

    def global_search(self, query: str) -> list[dict]:
        pattern = f"%{query}%"
        stmt = (
            select(Meeting)
            .outerjoin(Meeting.participants)
            .outerjoin(Meeting.transcript_segments)
            .outerjoin(Meeting.summary)
            .outerjoin(Meeting.topics)
            .where(
                or_(
                    Meeting.title.ilike(pattern),
                    Meeting.description.ilike(pattern),
                    Participant.name.ilike(pattern),
                    TranscriptSegment.text.ilike(pattern),
                    Summary.summary.ilike(pattern),
                    Topic.topic.ilike(pattern),
                )
            )
            .options(selectinload(Meeting.participants))
            .distinct()
        )
        return [
            {
                "id": meeting.id,
                "title": meeting.title,
                "meeting_date": meeting.meeting_date,
                "participants": [person.name for person in meeting.participants],
            }
            for meeting in self.db.scalars(stmt).unique()
        ]

