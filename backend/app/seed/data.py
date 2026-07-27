from datetime import datetime, timedelta

MEETINGS = [
    ("Q3 Product Sync & Roadmap Review", "Product", 2712),
    ("Design System Overhaul Review", "Design", 4500),
    ("Customer Interview: Acme Corp", "Research", 1925),
    ("Marketing Campaign Kickoff", "Marketing", 3320),
    ("Sales Demo: TechCorp", "Sales", 2530),
]

SPEAKERS = [
    ("Sarah Jenkins", "sarah@example.com"),
    ("Mike Chen", "mike@example.com"),
    ("David Okafor", "david@example.com"),
    ("Aryan Tyagi", "aryan@example.com"),
    ("Alex Rivera", "alex@example.com"),
]

TRANSCRIPT = [
    ("Sarah Jenkins", 0, 14, "Alright, let's get started. We have a lot to cover today regarding the Q4 roadmap. Are we all here?"),
    ("Mike Chen", 15, 21, "Yeah, I'm here. David is joining in a minute."),
    ("Sarah Jenkins", 22, 44, "Great. The main objective is to finalize resource allocation for the infrastructure migration. I want to make sure we are not bottlenecking the backend team."),
    ("David Okafor", 45, 61, "Sorry I'm late. The timeline is aggressive if we also roll out the new authentication service simultaneously."),
    ("Mike Chen", 62, 74, "I agree with David. We need two more sprint cycles dedicated to testing the migration before touching auth."),
    ("Sarah Jenkins", 75, 90, "Okay, let's push auth to Q1. Mike, can you update the Jira epic to reflect that change?"),
]


def seed(db):
    from sqlalchemy import func, select

    from app.models import ActionItem, Meeting, Participant, Summary, Topic, TranscriptSegment

    if db.scalar(select(func.count(Meeting.id))):
        return
    participants = [Participant(name=name, email=email) for name, email in SPEAKERS]
    db.add_all(participants)
    db.flush()
    for index, (title, category, duration) in enumerate(MEETINGS):
        meeting = Meeting(
            title=title,
            description=f"{category} team meeting with decisions, risks, and next steps.",
            meeting_date=datetime(2026, 7, 24, 10, 0) - timedelta(days=index * 3),
            duration_seconds=duration,
            status="processing" if index == 2 else "transcribed",
            participants=participants[: 3 + (index % 3)],
        )
        meeting.transcript_segments = [
            TranscriptSegment(
                speaker=speaker,
                start_time=start + index * 2,
                end_time=end + index * 2,
                text=text,
                sequence_number=sequence,
            )
            for sequence, (speaker, start, end, text) in enumerate(TRANSCRIPT)
        ]
        meeting.summary = Summary(
            summary="The team reviewed infrastructure migration timing, staffing constraints, and authentication rollout dependencies. Authentication moved to Q1 so migration testing can receive two dedicated sprint cycles.",
            outline="- Infrastructure migration\n- Resource allocation\n- Authentication timeline\n- Testing plan",
        )
        meeting.topics = [
            Topic(topic="Infrastructure Migration"),
            Topic(topic="Resource Allocation"),
            Topic(topic="Q4 Roadmap"),
        ]
        meeting.action_items = [
            ActionItem(description="Update the Jira epic with the Q1 authentication timeline.", assignee="Mike Chen"),
            ActionItem(description="Confirm backend testing capacity for two sprint cycles.", assignee="Sarah Jenkins"),
            ActionItem(description="Share the revised migration plan with stakeholders.", assignee="David Okafor", completed=index % 2 == 0),
        ]
        db.add(meeting)
    db.commit()
