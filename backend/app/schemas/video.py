from pydantic import BaseModel, ConfigDict, Field

from app.schemas.summary import SummaryOut

# Canonical summary model — aliased here to avoid duplicate definitions.
SummaryWithLanguage = SummaryOut


class VideoProcessRequest(BaseModel):
    youtube_url: str = Field(..., min_length=1, max_length=2048)
    language_code: str | None = Field(None, min_length=2, max_length=16)
    summary_length: str | None = Field(None, pattern="^(short|medium|detailed)$")


class GenerateContentRequest(BaseModel):
    language_code: str = Field(..., min_length=2, max_length=16)
    summary_length: str = Field("detailed", pattern="^(short|medium|detailed)$")


class SummaryGenerationRequest(BaseModel):
    """Body for POST /summary — language optional (defaults to original)."""

    language_code: str | None = Field(None, min_length=2, max_length=16)
    summary_length: str | None = Field(None, pattern="^(short|medium|detailed)$")


class VideoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    youtube_id: str
    youtube_url: str
    title: str | None = None
    thumbnail_url: str | None = None
    duration: int | None = None


class VideoBrief(BaseModel):
    id: int
    youtube_id: str
    title: str | None = None


class LanguageInfo(BaseModel):
    code: str
    name: str
    english_name: str


class TranscriptVersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    language_code: str | None = None
    is_original: bool = True
    content: str


class TranscriptOut(TranscriptVersionOut):
    id: int


class TranscriptBrief(BaseModel):
    content: str
    language_code: str | None = None
    is_original: bool = True


class SummaryErrorInfo(BaseModel):
    code: str
    message: str


class ProcessVideoResponse(BaseModel):
    success: bool = True
    video: VideoOut
    transcript: TranscriptOut
    summary: SummaryOut | None = None
    summary_error: SummaryErrorInfo | None = None
    language: LanguageInfo | None = None
    summary_length: str | None = None


class VideoDetailResponse(BaseModel):
    success: bool = True
    video: VideoOut
    has_transcript: bool
    has_summary: bool


class TranscriptResponse(BaseModel):
    success: bool = True
    video_id: int
    transcript: TranscriptBrief


class GenerateResponse(BaseModel):
    """Multilingual generation result.

    Partial success: `summary` is None and `summary_error` is set when the
    translated transcript was created but summary generation failed.
    """

    success: bool = True
    video: VideoBrief
    language: LanguageInfo
    transcript: TranscriptVersionOut
    summary: SummaryOut | None = None
    summary_error: SummaryErrorInfo | None = None
