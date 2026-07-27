from collections import Counter

STOP_WORDS = {
    "about", "after", "again", "also", "and", "are", "because", "been", "before",
    "being", "can", "could", "for", "from", "have", "into", "just", "more", "need",
    "our", "that", "the", "their", "then", "there", "they", "this", "today", "want",
    "was", "we", "were", "will", "with", "would", "you", "your",
}


def generate_summary(segments: list) -> dict:
    sentences = [segment.text.strip() for segment in segments if segment.text.strip()]
    summary = " ".join(sentences[:4])
    words = Counter(
        word.lower().strip(".,!?;:()")
        for sentence in sentences
        for word in sentence.split()
        if len(word) > 4 and word.lower().strip(".,!?;:()") not in STOP_WORDS
    )
    topics = [word.title() for word, _ in words.most_common(4)]
    action_items = []
    for segment in segments:
        lowered = segment.text.lower()
        if any(marker in lowered for marker in ("can you", "will you", "action item", "follow up")):
            action_items.append(
                {"description": segment.text, "assignee": segment.speaker}
            )
    if not action_items and segments:
        action_items.append(
            {
                "description": "Review meeting decisions and confirm next steps.",
                "assignee": segments[-1].speaker,
            }
        )
    return {
        "summary": summary or "No summary available.",
        "outline": "\n".join(f"- {sentence}" for sentence in sentences[:6]),
        "topics": topics or ["Meeting"],
        "action_items": action_items[:5],
    }
