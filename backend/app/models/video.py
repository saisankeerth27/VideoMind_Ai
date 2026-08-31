from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # Nullable until authentication exists (Phase 5+): videos can be processed anonymously
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    youtube_id: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    youtube_url: Mapped[str] = mapped_column(String(512), nullable=False)
    title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    duration: Mapped[int | None] = mapped_column(Integer, nullable=True)  # duration in seconds
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="videos")
    transcripts: Mapped[list["Transcript"]] = relationship(
        back_populates="video", cascade="all, delete-orphan"
    )
    summaries: Mapped[list["Summary"]] = relationship(
        back_populates="video", cascade="all, delete-orphan"
    )

    @property
    def original_transcript(self) -> "Transcript | None":
        return next((t for t in self.transcripts if t.is_original), None)
