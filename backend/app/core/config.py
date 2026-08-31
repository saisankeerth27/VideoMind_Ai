from functools import lru_cache
from urllib.parse import quote_plus

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

    # MySQL
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "youtube_ai"
    MYSQL_USERNAME: str = "root"
    MYSQL_PASSWORD: str = ""

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
        # Percent-encode credentials so special characters (e.g. "@" in passwords) are safe
        password = quote_plus(self.MYSQL_PASSWORD)
        username = quote_plus(self.MYSQL_USERNAME)
        return (
            f"mysql+pymysql://{username}:{password}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

