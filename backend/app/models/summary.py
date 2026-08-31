from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Summary(Base):
    __tablename__ = "summaries"
    __table_args__ = (UniqueConstraint("video_id", "language_code", "summary_length", name="uq_summaries_video_lang_len"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    video_id: Mapped[int] = mapped_column(
        ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True
    )
    language_code: Mapped[str] = mapped_column(String(16), default="en", nullable=False)
    summary_length: Mapped[str | None] = mapped_column(String(16), default="detailed", nullable=True)
    overview: Mapped[str | None] = mapped_column(Text, nullable=True)
    detailed_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_points: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)  # type: ignore[type-var]
    important_concepts: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)  # type: ignore[type-var]
    main_takeaways: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)  # type: ignore[type-var]
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    video: Mapped["Video"] = relationship(back_populates="summaries")
