"""One-time migration: update summaries unique constraint to include summary_length.

Run with: python -m scripts.migrate_summary_constraint
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database.database import engine

OLD_CONSTRAINT = "uq_summaries_video_lang"
NEW_CONSTRAINT = "uq_summaries_video_lang_len"

UPGRADE_SQL = f"""
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS {OLD_CONSTRAINT};
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS {OLD_CONSTRAINT};
ALTER TABLE summaries ADD CONSTRAINT {NEW_CONSTRAINT} UNIQUE (video_id, language_code, summary_length);
"""

DOWNGRADE_SQL = f"""
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS {NEW_CONSTRAINT};
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS {NEW_CONSTRAINT};
ALTER TABLE summaries ADD CONSTRAINT {OLD_CONSTRAINT} UNIQUE (video_id, language_code);
"""


def upgrade():
    with engine.begin() as conn:
        for statement in UPGRADE_SQL.strip().split(";"):
            stmt = statement.strip()
            if stmt:
                try:
                    conn.execute(text(stmt))
                    print(f"  OK: {stmt[:80]}...")
                except Exception as e:
                    print(f"  SKIP: {stmt[:80]}... ({e})")
    print("Migration complete.")


def downgrade():
    with engine.begin() as conn:
        for statement in DOWNGRADE_SQL.strip().split(";"):
            stmt = statement.strip()
            if stmt:
                try:
                    conn.execute(text(stmt))
                    print(f"  OK: {stmt[:80]}...")
                except Exception as e:
                    print(f"  SKIP: {stmt[:80]}... ({e})")
    print("Downgrade complete.")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
