from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "VideoMind Ai"
    DEBUG: bool = False

    # PostgreSQL
    DATABASE_URL: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # AI provider — Google Gemini via the official google-genai SDK.
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-flash-latest"
    # Comma-separated models tried (in order) when the primary returns a transient 5xx
    AI_FALLBACK_MODELS: str = "gemini-flash-lite-latest"
    SUMMARY_CHUNK_MAX_CHARS: int = 6000

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

