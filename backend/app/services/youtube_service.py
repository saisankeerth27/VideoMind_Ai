"""YouTube URL validation, video ID extraction and transcript retrieval.

All YouTube-related logic lives here so the transcript provider can be
swapped out later without touching API routes or database code.

Uses youtube-transcript-api (no YouTube Data API key required).
"""

import re
from dataclasses import dataclass

from youtube_transcript_api import (
    CouldNotRetrieveTranscript,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
    YouTubeTranscriptApi,
)

# 11-character YouTube video IDs (letters, digits, hyphen, underscore)
_VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")

_URL_PATTERNS = [
    # https://www.youtube.com/watch?v=VIDEO_ID (+ optional extra params)
    re.compile(r"^https?://(?:www\.)?youtube\.com/watch\?(?:[^#]*&)?v=(?P<id>[A-Za-z0-9_-]{11})(?:[&#].*)?$"),
    # https://youtu.be/VIDEO_ID (+ optional extra params)
    re.compile(r"^https?://(?:www\.)?youtu\.be/(?P<id>[A-Za-z0-9_-]{11})(?:[?#].*)?$"),
    # https://www.youtube.com/shorts/VIDEO_ID (+ optional extra params)
    re.compile(r"^https?://(?:www\.)?youtube\.com/shorts/(?P<id>[A-Za-z0-9_-]{11})(?:[?#].*)?$"),
    # https://www.youtube.com/embed/VIDEO_ID (+ optional extra params)
    re.compile(r"^https?://(?:www\.)?youtube\.com/embed/(?P<id>[A-Za-z0-9_-]{11})(?:[?#].*)?$"),
]

_PREFERRED_LANGUAGES = ["en", "en-US", "en-GB"]


@dataclass
class TranscriptResult:
    content: str
    language_code: str | None
    is_generated: bool | None = None


def extract_video_id(url: str | None) -> str:
    """Return the 11-character video ID from a supported YouTube URL.

    Raises ValueError for empty/malformed input or unsupported domains.
    """
    if not url or not url.strip():
        raise ValueError("YouTube URL is required.")

    candidate = url.strip()

    # If no scheme, try with https:// prepended for pattern matching
    if not candidate.startswith("http://") and not candidate.startswith("https://"):
        candidate = "https://" + candidate

    for pattern in _URL_PATTERNS:
        match = pattern.match(candidate)
        if match:
            return match.group("id")

    raise ValueError("The provided URL is not a valid YouTube video URL.")


def build_watch_url(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"


def build_thumbnail_url(video_id: str) -> str:
    return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"


def _clean_transcript_text(snippets) -> str:
    """Join raw caption snippets into clean, readable text."""
    raw_text = " ".join(snippet.text.replace("\n", " ") for snippet in snippets)
    # Collapse repeated whitespace introduced by joining/captions
    cleaned = re.sub(r"\s+", " ", raw_text).strip()
    return cleaned


def fetch_transcript(video_id: str) -> TranscriptResult:
    """Fetch the transcript for a video, preferring English.

    Falls back to the first available language instead of failing when no
    English track exists. Raises youtube-transcript-api exceptions on failure;
    callers translate them into application errors.
    """
    ytt_api = YouTubeTranscriptApi()

    try:
        transcript_list = ytt_api.list(video_id)
        try:
            transcript = transcript_list.find_transcript(_PREFERRED_LANGUAGES)
        except NoTranscriptFound:
            # Graceful fallback: use whatever language is available
            transcript = next(iter(transcript_list))

        fetched = transcript.fetch()
        return TranscriptResult(
            content=_clean_transcript_text(fetched),
            language_code=transcript.language_code,
            is_generated=transcript.is_generated,
        )
    except TranscriptsDisabled:
        raise
    except NoTranscriptFound:
        raise
    except VideoUnavailable:
        raise
    except CouldNotRetrieveTranscript:
        # Covers IP blocks, request failures and other provider-side issues
        raise
