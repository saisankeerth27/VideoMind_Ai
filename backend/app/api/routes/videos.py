import logging
import time

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.database.database import get_db
from app.models.summary import Summary
from app.models.transcript import Transcript
from app.models.video import Video
from app.schemas.summary import SummaryOut, SummaryResponse
from app.schemas.video import (
    GenerateContentRequest,
    GenerateResponse,
    LanguageInfo,
    ProcessVideoResponse,
    SummaryErrorInfo,
    SummaryGenerationRequest,
    TranscriptOut,
    TranscriptResponse,
    TranscriptVersionOut,
    VideoBrief,
    VideoDetailResponse,
    VideoOut,
    VideoProcessRequest,
)
from app.services.ai_service import generate_summary, translate_transcript
from app.services.youtube_service import (
    build_thumbnail_url,
    build_watch_url,
    extract_video_id,
    fetch_transcript,
)
from app.utils.language_utils import get_language, language_name

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/videos", tags=["videos"])

DEFAULT_SUMMARY_LENGTH = "detailed"


# ---------------------------------------------------------------------------
# Processing (transcript extraction + persistence)
# ---------------------------------------------------------------------------

def _fetch_or_raise(video_id: str):
    from youtube_transcript_api import (
        CouldNotRetrieveTranscript,
        NoTranscriptFound,
        TranscriptsDisabled,
        VideoUnavailable,
    )

    try:
        return fetch_transcript(video_id)
    except TranscriptsDisabled:
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")
    except NoTranscriptFound:
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")
    except VideoUnavailable:
        raise AppError(404, "VIDEO_NOT_FOUND", "We couldn't access this YouTube video. It may be private or removed.")
    except CouldNotRetrieveTranscript:
        raise AppError(
            503,
            "EXTERNAL_SERVICE_ERROR",
            "The transcript service is temporarily unavailable. Please try again later.",
        )
    except Exception as exc:
        logger.exception("Unexpected error fetching transcript for %s", video_id)
        raise AppError(
            503,
            "EXTERNAL_SERVICE_ERROR",
            "Could not retrieve the video transcript. Please try again.",
        ) from exc


def _process_payload(db: Session, payload: VideoProcessRequest) -> tuple[Video, Transcript]:
    try:
        youtube_id = extract_video_id(payload.youtube_url)
    except ValueError as exc:
        raise AppError(400, "INVALID_YOUTUBE_URL", str(exc))

    video = db.scalar(select(Video).where(Video.youtube_id == youtube_id))

    if video is None:
        video = Video(
            user_id=None,
            youtube_id=youtube_id,
            youtube_url=build_watch_url(youtube_id),
            title="YouTube Video",
            thumbnail_url=build_thumbnail_url(youtube_id),
        )
        db.add(video)

    if video.id is None or video.original_transcript is None:
        result = _fetch_or_raise(youtube_id)
        if video.id is None:
            db.add(video)
        transcript = Transcript(
            content=result.content,
            language_code=result.language_code,
            is_original=True,
        )
        video.transcripts.append(transcript)
        try:
            db.commit()
            db.refresh(video)
            db.refresh(transcript)
        except SQLAlchemyError as exc:
            db.rollback()
            logger.exception("Database failure while saving video %s", youtube_id)
            raise AppError(500, "DATABASE_ERROR", "Failed to save the video data. Please try again.") from exc
    else:
        transcript = video.original_transcript

    return video, transcript


@router.post("/process", response_model=ProcessVideoResponse)
def process_video(payload: VideoProcessRequest, db: Session = Depends(get_db)):
    t_start = time.perf_counter()
    video, transcript = _process_payload(db, payload)
    elapsed = time.perf_counter() - t_start
    logger.info("[PERF] process_video=%.1fs chars=%s", elapsed, len(transcript.content) if transcript else 0)

    # If language_code provided, generate summary in the same request
    summary_out = None
    summary_error = None
    lang_info = None
    summary_length = payload.summary_length or DEFAULT_SUMMARY_LENGTH

    if payload.language_code:
        language_entry = get_language(payload.language_code)
        if language_entry is None:
            raise AppError(400, "INVALID_LANGUAGE", f"'{payload.language_code}' is not a supported output language.")

        lang_info = LanguageInfo(**language_entry)
        target_code = language_entry["code"]
        original_code = (transcript.language_code or "").lower()
        needs_translation = target_code != original_code

        translated_row = None
        if needs_translation:
            translated_row = _resolve_translated_row(db, video, transcript, target_code, False)

        source_text = _summary_source_text(transcript, translated_row)
        summary_row = next(
            (s for s in video.summaries if s.language_code == target_code
             and (s.summary_length or DEFAULT_SUMMARY_LENGTH) == summary_length),
            None,
        )

        try:
            summary_row = _upsert_summary(
                db=db, video=video, language_entry=language_entry,
                source_text=source_text, summary_length=summary_length,
                force=False, existing=summary_row,
            )
            summary_out = SummaryOut.model_validate(summary_row)
        except AppError as exc:
            logger.warning("SUMMARY_FAILED in process video=%s lang=%s code=%s", video.id, target_code, exc.code)
            summary_error = SummaryErrorInfo(code=exc.code, message=exc.message)

    return ProcessVideoResponse(
        video=VideoOut.model_validate(video),
        transcript=TranscriptOut.model_validate(transcript),
        summary=summary_out,
        summary_error=summary_error,
        language=lang_info,
        summary_length=summary_length if payload.language_code else None,
    )


# ---------------------------------------------------------------------------
# Read endpoints
# ---------------------------------------------------------------------------

def _get_video_or_404(db: Session, video_id: int) -> Video:
    video = db.get(Video, video_id)
    if video is None:
        raise AppError(404, "VIDEO_NOT_FOUND", "The requested video could not be found.")
    return video


@router.get("/{video_id}", response_model=VideoDetailResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = _get_video_or_404(db, video_id)
    return VideoDetailResponse(
        video=VideoOut.model_validate(video),
        has_transcript=video.original_transcript is not None,
        has_summary=len(video.summaries) > 0,
    )


@router.get("/{video_id}/transcript", response_model=TranscriptResponse)
def get_video_transcript(video_id: int, db: Session = Depends(get_db)):
    video = _get_video_or_404(db, video_id)
    original = video.original_transcript
    if original is None:
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")
    return TranscriptResponse(
        video_id=video.id,
        transcript={
            "content": original.content,
            "language_code": original.language_code,
            "is_original": True,
        },
    )


# ---------------------------------------------------------------------------
# Multilingual generation
# ---------------------------------------------------------------------------

def _summary_source_text(original: Transcript, translated: Transcript | None) -> str:
    """Prefer the translated transcript as summary source when available."""
    if translated is not None and not translated.is_original and translated.content.strip():
        return translated.content
    return original.content


def _upsert_summary(
    db: Session,
    video: Video,
    language_entry: dict,
    source_text: str,
    summary_length: str,
    force: bool,
    existing: Summary | None,
) -> Summary:
    """Generate (when needed/forced) and persist a language+length-specific summary."""
    length_matches = existing is not None and (existing.summary_length or DEFAULT_SUMMARY_LENGTH) == summary_length
    if existing is not None and not force and length_matches:
        return existing

    logger.info(
        "Starting summary generation video=%s lang=%s length=%s",
        video.id, language_entry["code"], summary_length,
    )
    summary_data = generate_summary(source_text, language_name(language_entry["code"]), summary_length)

    if existing is None:
        existing = Summary(
            video_id=video.id,
            language_code=language_entry["code"],
            summary_length=summary_length,
            **summary_data,
        )
        video.summaries.append(existing)
    else:
        existing.summary_length = summary_length
        for field, value in summary_data.items():
            setattr(existing, field, value)

    try:
        db.commit()
        db.refresh(existing)
    except SQLAlchemyError:
        db.rollback()
        logger.exception(
            "DATABASE_ERROR saving summary video=%s lang=%s len=%s",
            video.id, language_entry["code"], summary_length,
        )
        raise AppError(500, "DATABASE_ERROR", "Failed to save the summary. Please try again.")

    logger.info("Summary saved successfully video=%s lang=%s length=%s", video.id, language_entry["code"], summary_length)
    return existing


def _resolve_translated_row(
    db: Session,
    video: Video,
    original: Transcript,
    target_code: str,
    regenerate_translation: bool,
) -> Transcript | None:
    """Return the translated transcript row for target_code, creating it if needed."""
    translated_row = next(
        (t for t in video.transcripts if t.language_code == target_code and not t.is_original),
        None,
    )
    if translated_row is not None and not regenerate_translation:
        return translated_row

    translated_text = translate_transcript(original.content, get_language(target_code)["english_name"])
    if translated_row is None:
        translated_row = Transcript(
            content=translated_text,
            language_code=target_code,
            is_original=False,
        )
        video.transcripts.append(translated_row)
    else:
        translated_row.content = translated_text

    try:
        # Commit translation FIRST so it survives a summary failure (partial success)
        db.commit()
        db.refresh(translated_row)
        logger.info("Translated transcript saved video=%s lang=%s", video.id, target_code)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("DATABASE_ERROR saving translation video=%s lang=%s", video.id, target_code)
        raise AppError(500, "DATABASE_ERROR", "Failed to save the translated transcript. Please try again.")
    return translated_row


@router.post("/{video_id}/generate", response_model=GenerateResponse)
def generate_multilingual_content(
    video_id: int,
    payload: GenerateContentRequest,
    regenerate_summary: bool = False,
    regenerate_translation: bool = False,
    db: Session = Depends(get_db),
):
    """Generate/reuse the translated transcript + AI summary for a language.

    - Caches by (language, summary_length); reuse unless regeneration flags set.
    - Same-language requests never trigger a translation.
    - Partial success: a saved translation is kept even if the summary fails.
    """
    t_start = time.perf_counter()
    video = _get_video_or_404(db, video_id)
    language_entry = get_language(payload.language_code)
    if language_entry is None:
        raise AppError(
            400,
            "INVALID_LANGUAGE",
            f"'{payload.language_code}' is not a supported output language.",
        )

    original = video.original_transcript
    if original is None or not original.content.strip():
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")

    target_code = language_entry["code"]
    original_code = (original.language_code or "").lower()
    needs_translation = target_code != original_code

    logger.info(
        "Starting multilingual generation video=%s target=%s length=%s",
        video_id, target_code, payload.summary_length,
    )

    translated_row: Transcript | None = None
    if needs_translation:
        translated_row = _resolve_translated_row(
            db, video, original, target_code, regenerate_translation
        )

    # --- Summary stage -----------------------------------------------------
    summary_row = next((s for s in video.summaries if s.language_code == target_code and (s.summary_length or DEFAULT_SUMMARY_LENGTH) == payload.summary_length), None)
    source_text = _summary_source_text(original, translated_row)

    try:
        summary_row = _upsert_summary(
            db=db,
            video=video,
            language_entry=language_entry,
            source_text=source_text,
            summary_length=payload.summary_length,
            force=regenerate_summary or regenerate_translation,
            existing=summary_row,
        )
        summary_out = SummaryOut.model_validate(summary_row)
        summary_error = None
    except AppError as exc:
        # Preserve the successful translation; report summary failure cleanly.
        logger.warning(
            "SUMMARY_FAILED (transcript preserved) video=%s lang=%s code=%s",
            video_id, target_code, exc.code,
        )
        summary_out = None
        summary_error = SummaryErrorInfo(code=exc.code, message=exc.message)

    active_transcript = translated_row if translated_row is not None else original

    elapsed = time.perf_counter() - t_start
    logger.info("[PERF] generate=%.1fs video=%s lang=%s length=%s summary=%s", elapsed, video_id, target_code, payload.summary_length, "ok" if summary_out else "failed")

    return GenerateResponse(
        video=VideoBrief(id=video.id, youtube_id=video.youtube_id, title=video.title),
        language=LanguageInfo(**language_entry),
        transcript=TranscriptVersionOut.model_validate(active_transcript),
        summary=summary_out,
        summary_error=summary_error,
    )


# ---------------------------------------------------------------------------
# Language-scoped summary endpoint
# ---------------------------------------------------------------------------

@router.post("/{video_id}/summary", response_model=SummaryResponse)
def create_video_summary(
    video_id: int,
    payload: SummaryGenerationRequest | None = None,
    regenerate: bool = False,
    db: Session = Depends(get_db),
):
    """Generate/reuse the AI summary for one specific language.

    Body optional; without `language_code` the original transcript's language is used.
    """
    video = _get_video_or_404(db, video_id)
    original = video.original_transcript
    if original is None or not original.content.strip():
        raise AppError(404, "TRANSCRIPT_UNAVAILABLE", "A transcript is not available for this video.")

    requested_code = (payload.language_code if payload else None) or original.language_code or "en"
    language_entry = get_language(requested_code)
    if language_entry is None:
        raise AppError(400, "INVALID_LANGUAGE", f"'{requested_code}' is not a supported output language.")
    summary_length = (payload.summary_length if payload else None) or DEFAULT_SUMMARY_LENGTH

    target_code = language_entry["code"]
    translated_row = next(
        (t for t in video.transcripts if t.language_code == target_code and not t.is_original),
        None,
    )
    summary_row = next((s for s in video.summaries if s.language_code == target_code and (s.summary_length or DEFAULT_SUMMARY_LENGTH) == summary_length), None)

    if summary_row is not None and not regenerate and (summary_row.summary_length or "detailed") == summary_length:
        return SummaryResponse(video_id=video.id, summary=SummaryOut.model_validate(summary_row))

    logger.info("Starting summary generation video=%s lang=%s length=%s", video_id, target_code, summary_length)
    summary_row = _upsert_summary(
        db=db,
        video=video,
        language_entry=language_entry,
        source_text=_summary_source_text(original, translated_row),
        summary_length=summary_length,
        force=True,
        existing=summary_row,
    )
    return SummaryResponse(video_id=video.id, summary=SummaryOut.model_validate(summary_row))
