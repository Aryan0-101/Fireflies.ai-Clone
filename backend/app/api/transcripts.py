from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import MAX_UPLOAD_BYTES, UPLOAD_DIR
from app.core.database import get_db
from app.core.exceptions import AppError, NotFoundError
from app.models import TranscriptSegment
from app.schemas import MeetingDetail, SegmentOut
from app.services.meeting_service import MeetingService
from app.services.transcript_service import parse_transcript

router = APIRouter(prefix="/api/transcripts", tags=["transcripts"])


@router.get("/{meeting_id}", response_model=list[SegmentOut])
def get_transcript(meeting_id: int, db: Session = Depends(get_db)):
    return MeetingService(db).get(meeting_id).transcript_segments


@router.post("/upload", response_model=MeetingDetail)
async def upload_transcript(
    meeting_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise AppError("FILE_TOO_LARGE", "Transcript file exceeds 10 MB.", 413)
    text = content.decode("utf-8-sig")
    segments = parse_transcript(file.filename or "transcript.txt", text)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / f"{meeting_id}-{file.filename or 'transcript.txt'}").write_bytes(content)
    return MeetingService(db).attach_transcript(meeting_id, segments)


@router.get("/search/results", response_model=list[SegmentOut])
def search_transcript(
    meeting_id: int,
    keyword: str = Query(min_length=1),
    db: Session = Depends(get_db),
):
    if not db.get(__import__("app.models", fromlist=["Meeting"]).Meeting, meeting_id):
        raise NotFoundError("meeting")
    stmt = (
        select(TranscriptSegment)
        .where(
            TranscriptSegment.meeting_id == meeting_id,
            TranscriptSegment.text.ilike(f"%{keyword}%"),
        )
        .order_by(TranscriptSegment.sequence_number)
    )
    return list(db.scalars(stmt))
