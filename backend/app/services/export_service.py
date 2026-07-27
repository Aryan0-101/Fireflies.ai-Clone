from __future__ import annotations

from io import BytesIO


def as_markdown(meeting) -> str:
    lines = [
        f"# {meeting.title}",
        "",
        f"Date: {meeting.meeting_date.isoformat()}",
        f"Duration: {meeting.duration_seconds} seconds",
        "",
        "## Summary",
        meeting.summary.summary if meeting.summary else "No summary.",
        "",
        "## Action Items",
    ]
    lines.extend(
        f"- [{'x' if item.completed else ' '}] {item.description} ({item.assignee})"
        for item in meeting.action_items
    )
    lines.extend(["", "## Transcript"])
    lines.extend(
        f"- **{segment.speaker} [{segment.start_time}s]** {segment.text}"
        for segment in meeting.transcript_segments
    )
    return "\n".join(lines)


def as_text(meeting) -> str:
    return as_markdown(meeting).replace("# ", "").replace("## ", "").replace("**", "")


def as_pdf(meeting) -> bytes:
    text = as_text(meeting)
    lines = []
    for source_line in text.splitlines():
        while len(source_line) > 92:
            split_at = source_line.rfind(" ", 0, 92)
            split_at = split_at if split_at > 0 else 92
            lines.append(source_line[:split_at])
            source_line = source_line[split_at:].lstrip()
        lines.append(source_line)
    content = ["BT", "/F1 10 Tf", "48 760 Td", "13 TL"]
    for line in lines[:52]:
        escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        content.extend([f"({escaped}) Tj", "T*"])
    content.append("ET")
    stream = "\n".join(content).encode("latin-1", errors="replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    output = BytesIO()
    output.write(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(output.tell())
        output.write(f"{index} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = output.tell()
    output.write(f"xref\n0 {len(objects) + 1}\n".encode())
    output.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.write(f"{offset:010} 00000 n \n".encode())
    output.write(
        f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode()
    )
    return output.getvalue()
