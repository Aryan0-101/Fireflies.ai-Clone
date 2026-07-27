from __future__ import annotations

import json
import re
from pathlib import Path

from app.core.exceptions import AppError

TIMESTAMP = re.compile(
    r"(?P<speaker>[^\[\n]+?)\s*\[(?P<time>\d{1,2}:\d{2}(?::\d{2})?)\]\s*(?P<text>.*?)(?=\n\S[^\n]*\[\d|\Z)",
    re.DOTALL,
)
VTT_CUE = re.compile(
    r"(?P<start>\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*-->\s*"
    r"(?P<end>\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*\n"
    r"(?:(?P<speaker>[^\n:]+):\s*)?(?P<text>.*?)(?=\n\n|\Z)",
    re.DOTALL,
)


def seconds(value: str | int | float) -> int:
    if isinstance(value, (int, float)):
        return int(value)
    parts = value.replace(",", ".").split(":")
    result = 0.0
    for part in parts:
        result = result * 60 + float(part)
    return int(result)


def parse_txt(content: str) -> list[dict]:
    segments = []
    for index, match in enumerate(TIMESTAMP.finditer(content)):
        start = seconds(match.group("time"))
        segments.append(
            {
                "speaker": match.group("speaker").strip(),
                "start_time": start,
                "end_time": start + 10,
                "text": " ".join(match.group("text").split()),
                "sequence_number": index,
            }
        )
    if not segments and content.strip():
        segments.append(
            {
                "speaker": "Speaker",
                "start_time": 0,
                "end_time": 10,
                "text": " ".join(content.split()),
                "sequence_number": 0,
            }
        )
    return segments


def parse_vtt(content: str) -> list[dict]:
    segments = []
    for index, match in enumerate(VTT_CUE.finditer(content)):
        segments.append(
            {
                "speaker": (match.group("speaker") or "Speaker").strip(),
                "start_time": seconds(match.group("start")),
                "end_time": seconds(match.group("end")),
                "text": " ".join(match.group("text").split()),
                "sequence_number": index,
            }
        )
    return segments


def parse_json(content: str) -> list[dict]:
    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AppError("INVALID_TRANSCRIPT", "Invalid JSON transcript.") from exc
    if not isinstance(payload, list):
        raise AppError("INVALID_TRANSCRIPT", "JSON transcript must be a list.")
    return [
        {
            "speaker": str(item.get("speaker", "Speaker")),
            "start_time": seconds(item.get("start", item.get("start_time", 0))),
            "end_time": seconds(item.get("end", item.get("end_time", 0))),
            "text": str(item.get("text", "")).strip(),
            "sequence_number": index,
        }
        for index, item in enumerate(payload)
        if str(item.get("text", "")).strip()
    ]


def parse_transcript(filename: str, content: str) -> list[dict]:
    suffix = Path(filename).suffix.lower()
    if suffix == ".txt":
        segments = parse_txt(content)
    elif suffix == ".vtt":
        segments = parse_vtt(content)
    elif suffix == ".json":
        segments = parse_json(content)
    else:
        raise AppError("INVALID_TRANSCRIPT_FORMAT", "Supported formats: .txt, .json, .vtt")
    if not segments:
        raise AppError("EMPTY_TRANSCRIPT", "Transcript contains no readable segments.")
    return segments
