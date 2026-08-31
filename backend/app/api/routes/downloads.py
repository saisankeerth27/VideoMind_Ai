"""Download endpoints: professional PDF generation from stored content."""

import logging

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.database.database import get_db
from app.models.video import Video
from app.services.pdf_service import (
    render_complete_pdf,
    render_summary_pdf,
    render_transcript_pdf,
    safe_filename_part,
)
from app.utils.language_utils import get_language

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/videos", tags=["downloads"])

DEFAULT_SUMMARY_LENGTH = "detailed"
VALID_SUMMARY_LENGTHS = ("short", "medium", "detailed")


def _pdf_response(pdf_bytes: bytes, filename: str) -> Response:
    disposition = 'attachment; filename="' + filename + '"'
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": disposition},
    )


def _get_video_or_404(db: Session, video_id: int) -> Video:
    video = db.get(Video, video_id)
    if video is None:
        raise AppError(404, "VIDEO_NOT_FOUND", "The requested video could not be found.")
    return video


def _resolve_language(video: Video, language_code: str | None):
    """Return (language_entry, transcript_row) for the requested language."""
    original = video.original_transcript
    if original is None:
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")

    if not language_code:
        code = original.language_code or "en"
    else:
        code = language_code.strip().lower()
        if code == "original":
            code = original.language_code or "en"

    entry = get_language(code)
    if entry is None:
        raise AppError(400, "INVALID_LANGUAGE", "'" + language_code + "' is not a supported language.")

    if code == (original.language_code or "").lower():
        return entry, original

    translated = next(
        (t for t in video.transcripts if t.language_code == code and not t.is_original),
        None,
    )
    if translated is None:
        message = "The " + entry["english_name"] + " version has not been generated yet."
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", message)
    return entry, translated


def _get_summary_dict(video: Video, language_code: str, summary_length: str = DEFAULT_SUMMARY_LENGTH) -> dict:
    """Get summary filtered by language AND summary_length."""
    summary_row = next(
        (s for s in video.summaries
         if s.language_code == language_code
         and (s.summary_length or DEFAULT_SUMMARY_LENGTH) == summary_length),
        None,
    )
    if summary_row is None:
        message = f"The {language_code} {summary_length} summary has not been generated yet. Generate it first."
        raise AppError(404, "SUMMARY_UNAVAILABLE", message)
    return {
        "overview": summary_row.overview or "",
        "detailed_explanation": summary_row.detailed_explanation or "",
        "key_points": summary_row.key_points or [],
        "important_concepts": summary_row.important_concepts or [],
        "main_takeaways": summary_row.main_takeaways or [],
        "conclusion": summary_row.conclusion or "",
    }


def _normalize_summary_length(length: str | None) -> str:
    if length and length.strip().lower() in VALID_SUMMARY_LENGTHS:
        return length.strip().lower()
    return DEFAULT_SUMMARY_LENGTH


def _length_label(length: str) -> str:
    return {"short": "Short", "medium": "Medium", "detailed": "Detailed"}.get(length, "Detailed")


@router.get("/{video_id}/summary/pdf")
def download_summary_pdf(
    video_id: int,
    language_code: str | None = None,
    summary_length: str | None = None,
    db: Session = Depends(get_db),
):
    video = _get_video_or_404(db, video_id)
    entry, transcript_row = _resolve_language(video, language_code)
    sl = _normalize_summary_length(summary_length)

    summary_dict = _get_summary_dict(video, entry["code"], sl)
    pdf_bytes = render_summary_pdf(
        video_title=video.title or "YouTube Video",
        language_code=entry["code"],
        language_name=entry["english_name"],
        summary=summary_dict,
        summary_length=sl,
    )
    filename = f"VideoMind-AI-Summary-{safe_filename_part(entry['english_name'])}-{_length_label(sl)}.pdf"
    return _pdf_response(pdf_bytes, filename)


@router.get("/{video_id}/transcript/pdf")
def download_transcript_pdf(video_id: int, language_code: str | None = None, db: Session = Depends(get_db)):
    video = _get_video_or_404(db, video_id)
    entry, transcript_row = _resolve_language(video, language_code)

    pdf_bytes = render_transcript_pdf(
        video_title=video.title or "YouTube Video",
        language_code=entry["code"],
        language_name=entry["english_name"],
        transcript_text=transcript_row.content,
    )
    filename = "VideoMind-AI-Transcript-" + safe_filename_part(entry["english_name"]) + ".pdf"
    return _pdf_response(pdf_bytes, filename)


@router.get("/{video_id}/transcript/pdf/original")
def download_original_transcript_pdf(video_id: int, db: Session = Depends(get_db)):
    video = _get_video_or_404(db, video_id)
    original = video.original_transcript
    if original is None:
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")

    lang_name = get_language(original.language_code)
    label = lang_name["english_name"] if lang_name else (original.language_code or "Original")

    pdf_bytes = render_transcript_pdf(
        video_title=video.title or "YouTube Video",
        language_code=(original.language_code or "en"),
        language_name=label,
        transcript_text=original.content,
    )
    filename = "VideoMind-AI-Transcript-Original.pdf"
    return _pdf_response(pdf_bytes, filename)


@router.get("/{video_id}/pdf")
def download_complete_pdf(
    video_id: int,
    language_code: str | None = None,
    summary_length: str | None = None,
    db: Session = Depends(get_db),
):
    video = _get_video_or_404(db, video_id)
    entry, transcript_row = _resolve_language(video, language_code)
    sl = _normalize_summary_length(summary_length)

    summary_dict = _get_summary_dict(video, entry["code"], sl)

    pdf_bytes = render_complete_pdf(
        video_title=video.title or "YouTube Video",
        language_code=entry["code"],
        language_name=entry["english_name"],
        summary=summary_dict,
        transcript_text=transcript_row.content,
        summary_length=sl,
    )
    filename = f"VideoMind-AI-Complete-{safe_filename_part(entry['english_name'])}-{_length_label(sl)}.pdf"
    return _pdf_response(pdf_bytes, filename)
