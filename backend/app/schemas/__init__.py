from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str


class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    description: str = ""
    meeting_date: datetime
    duration_seconds: int = Field(default=0, ge=0)
    participants: list[str] = []


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = None
    meeting_date: datetime | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    status: str | None = None


class SegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    speaker: str
    start_time: int
    end_time: int
    text: str
    sequence_number: int


class SummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    summary: str
    outline: str
    created_at: datetime


class ActionItemCreate(BaseModel):
    meeting_id: int
    description: str = Field(min_length=1)
    assignee: str = "Unassigned"
    completed: bool = False
    due_date: date | None = None


class ActionItemUpdate(BaseModel):
    description: str | None = None
    assignee: str | None = None
    completed: bool | None = None
    due_date: date | None = None


class ActionItemOut(ActionItemCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TopicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    topic: str


class MeetingListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    meeting_date: datetime
    duration_seconds: int
    status: str
    participants: list[ParticipantOut]
    topics: list[TopicOut]


class MeetingDetail(MeetingListItem):
    transcript_segments: list[SegmentOut]
    summary: SummaryOut | None
    action_items: list[ActionItemOut]


class PaginatedMeetings(BaseModel):
    items: list[MeetingListItem]
    total: int
    page: int
    page_size: int
