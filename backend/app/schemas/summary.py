from pydantic import BaseModel, ConfigDict, Field


class SummaryGenerationRequest(BaseModel):
    """Body for POST /summary — language optional (defaults to original)."""

    language_code: str | None = Field(None, min_length=2, max_length=16)
    summary_length: str | None = Field(None, pattern="^(short|medium|detailed)$")


class SummaryOut(BaseModel):
    """Canonical summary response model — reused everywhere."""

    model_config = ConfigDict(from_attributes=True)

    language_code: str = "en"
    summary_length: str | None = "detailed"
    overview: str
    # Optional: summaries created before this field existed store NULL
    detailed_explanation: str | None = ""
    key_points: list[str]
    important_concepts: list  # items: {"name": str, "explanation": str} (or legacy strings)
    main_takeaways: list[str]
    conclusion: str


class SummaryResponse(BaseModel):
    success: bool = True
    video_id: int
    summary: SummaryOut
