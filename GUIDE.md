Fireflies.ai Clone (Backend Only)
Backend Architecture & Implementation Guide

This document serves as the implementation guide for the backend of a Fireflies.ai clone. The frontend is intentionally excluded. The objective is to build a production-quality REST API capable of supporting a Next.js frontend while demonstrating good software architecture, database design, and clean engineering practices.

1. Objectives

Build a backend capable of:

Managing meetings
Storing transcripts
Storing AI generated summaries
Managing action items
Searching meetings
Searching transcript contents
Interactive timestamp retrieval
CRUD operations
File upload for transcripts
Export APIs
Global search
Mock AI services
Extensible architecture for future LLM integration

Speech-to-text is not implemented.

Instead:

transcript text is uploaded
transcript JSON can be uploaded
transcript can be seeded
2. Tech Stack

Backend

Python 3.12
FastAPI
SQLAlchemy 2.0
Alembic
SQLite
Pydantic
Uvicorn

Optional

LangChain
OpenAI
Ollama
Celery (future)
Redis (future)
3. High Level Architecture
                Client (NextJS)

                      │
               REST API (FastAPI)

                      │
        ┌─────────────┴─────────────┐
        │                           │
 Meeting Service             AI Service
 Transcript Service          Search Service
 Action Item Service         Export Service

                      │

              Repository Layer

                      │

              SQLAlchemy ORM

                      │

                 SQLite DB

Each service owns its business logic.

Repositories only access the database.

4. Folder Structure
backend/

│
├── app/
│
├── api/
│   ├── meetings.py
│   ├── transcripts.py
│   ├── summaries.py
│   ├── search.py
│   ├── exports.py
│   ├── action_items.py
│
├── core/
│   ├── config.py
│   ├── database.py
│   ├── exceptions.py
│
├── models/
│   ├── meeting.py
│   ├── transcript.py
│   ├── speaker.py
│   ├── summary.py
│   ├── action_item.py
│
├── repositories/
│   ├── meeting_repo.py
│   ├── transcript_repo.py
│   ├── summary_repo.py
│
├── services/
│   ├── meeting_service.py
│   ├── transcript_service.py
│   ├── ai_service.py
│   ├── search_service.py
│   ├── export_service.py
│
├── schemas/
│
├── utils/
│
├── seed/
│
├── uploads/
│
├── tests/
│
├── alembic/
│
└── main.py
5. System Modules
Module 1

Meeting Management

Responsibilities

create meeting
update meeting
delete meeting
fetch meetings
pagination
filters
Module 2

Transcript Service

Responsibilities

upload transcript
parse transcript
search transcript
return timestamps
transcript CRUD
Module 3

Summary Service

Responsibilities

store summaries
regenerate summaries
fetch summaries
Module 4

Action Item Service

Responsibilities

CRUD
completion status
due date
assignee
Module 5

Search Service

Responsibilities

Global search over

titles
participants
transcript
summary
topics
Module 6

Export Service

Export

TXT
Markdown
PDF
6. Database Design
Meeting
Meeting
-------

id
title
description
meeting_date
duration_seconds

created_at
updated_at
Participant
Participant

id
name
email
MeetingParticipant

Many-to-many

meeting_id

participant_id
TranscriptSegment
id

meeting_id

speaker

start_time

end_time

text

sequence_number

Each sentence becomes one row.

Example

0:00

John

Hello everyone.
Summary
id

meeting_id

summary

outline

created_at
ActionItem
id

meeting_id

description

assignee

completed

due_date
Topic
id

meeting_id

topic

Example

Budget

Hiring

Sprint

Marketing
Comment (Bonus)
id

meeting_id

segment_id

comment

author
Complete ER Diagram
Meeting
   │
   │ 1:N
   │
TranscriptSegment

Meeting
   │
   │1:1
Summary

Meeting
   │
   │1:N
ActionItem

Meeting
   │
   │N:M
Participant

Meeting
   │
   │1:N
Topic

TranscriptSegment
   │
   │1:N
Comment
7. API Design
Meetings
GET

/api/meetings

Returns

[
 {
   id,
   title,
   duration,
   participants,
   date
 }
]
GET

/api/meetings/{id}
POST

/api/meetings

Creates meeting.

PUT

/api/meetings/{id}

Updates metadata.

DELETE

/api/meetings/{id}

Deletes everything.

Cascade delete

transcript
summary
tasks
Transcript APIs
GET

/api/transcripts/{meeting_id}

Returns

[
 speaker,
 timestamp,
 text
]
POST

/api/transcripts/upload

Accept

.txt

.json

.vtt
GET

/api/transcripts/search

Query

meeting_id

keyword

Returns

[
 timestamp,
 text,
 speaker
]
Summary APIs
GET

/api/summaries/{meeting_id}
POST

/api/summaries/generate/{meeting_id}

Mock or LLM

Action Items
GET

/api/action-items/{meeting_id}
POST

/api/action-items
PATCH

/api/action-items/{id}
DELETE

/api/action-items/{id}
Global Search
GET

/api/search

Parameters

query

Searches

title
transcript
participants
summaries
Export
GET

/exports/txt/{meeting_id}
GET

/exports/md/{meeting_id}
GET

/exports/pdf/{meeting_id}
8. Interactive Transcript Flow

When frontend clicks

00:03:25

Backend returns

segment

speaker

text

timestamp

Frontend

Player.seek(205)

Likewise

Media Player

↓

Current Time

↓

GET Current Segment

↓

Highlight Active Segment

No websocket needed.

Polling every second is sufficient.

9. Transcript Parsing

Supported Formats

TXT
John [00:00]

Hello everyone.

Sarah [00:10]

Let's discuss hiring.

Converted into

Speaker

Timestamp

Text
VTT
00:00 --> 00:03

John

Hello.
JSON
[
 {
   speaker,
   start,
   end,
   text
 }
]
10. AI Summary Generation

Option 1

Seeded

summary.json

Option 2

OpenAI

Prompt

Summarize this meeting.

Return

Summary

Topics

Action Items

Response

Summary

Topics

Tasks

Stored in database.

11. Search Strategy

SQLite

LIKE '%budget%'

Future

SQLite FTS5

MATCH

Even later

Vector Search

ChromaDB

FAISS

pgvector
12. Repository Pattern

Example

MeetingRepository

create()

update()

delete()

find_by_id()

find_all()

Business logic never writes SQL.

Only repositories.

13. Service Layer

MeetingService

Create Meeting

↓

Save Meeting

↓

Parse Transcript

↓

Generate Summary

↓

Extract Tasks

↓

Return DTO

Services orchestrate multiple repositories and external AI providers, keeping API routes thin and focused on request validation.

14. Error Handling
Status	Scenario
400	Invalid transcript format
404	Meeting not found
409	Duplicate meeting
413	File too large
422	Validation error
500	Unexpected server error

Global exception middleware

{
    "success": false,
    "error": {
        "code": "MEETING_NOT_FOUND",
        "message": "Meeting does not exist."
    }
}
15. Authentication (Placeholder)

Authentication is intentionally omitted.

Use middleware that injects

user_id = 1

into requests.

Makes future JWT integration simple.

16. Seed Data

Seed

5 Meetings

Each contains

5 participants
40–100 transcript segments
AI summary
5 action items
topics
comments

Suggested meetings

Sprint Planning
Product Review
Engineering Standup
Sales Demo
Customer Discovery
17. Future Improvements
JWT Authentication
OAuth (Google/Microsoft)
Real audio upload
Whisper transcription
WebSocket live transcription
Background jobs (Celery + Redis)
Notifications
Team workspaces
Calendar integrations
Slack/Teams integrations
Vector database for semantic search
RAG-powered "Ask this meeting"
Speaker diarization
Real-time collaborative annotations
Audit logging and activity feeds
18. Testing Strategy
Unit Tests
Repository CRUD operations
Transcript parsers (.txt, .vtt, .json)
AI summary service (mocked)
Action item extraction logic
Export formatting
Integration Tests
Complete meeting creation workflow
File upload and parsing
Summary generation endpoint
Search endpoints
Cascade deletion
API Tests
Request validation
Pagination and filtering
Error responses
File upload limits

Target coverage: 80%+ for services and repositories.

19. Performance Considerations
Add indexes on meeting_date, title, participant_id, and meeting_id.
Use SQLite FTS5 for transcript search.
Paginate meeting library responses.
Lazy-load transcript segments for very large meetings.
Cache generated summaries if LLM generation is enabled.
Batch database inserts when importing transcripts.
20. End-to-End Backend Workflow
User uploads transcript
            │
            ▼
 Transcript Parser
            │
            ▼
 Create Meeting Record
            │
            ▼
 Save Transcript Segments
            │
            ▼
 Generate (or Load) AI Summary
            │
            ▼
 Extract Action Items & Topics
            │
            ▼
 Persist Summary, Tasks, Topics
            │
            ▼
 Meeting Available in Dashboard
            │
            ▼
 Search • Transcript Navigation • Exports • CRUD