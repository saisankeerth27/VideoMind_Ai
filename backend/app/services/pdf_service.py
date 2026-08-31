"""Professional PDF generation for VideoMind Ai.

Uses fpdf2 with embedded Noto fonts for full Unicode support
(Telugu, Hindi, Tamil, Arabic, CJK, etc.). Fonts live in app/assets/fonts.

Public API:
    render_summary_pdf(video_title, language_name, summary) -> bytes
    render_transcript_pdf(video_title, language_name, transcript_text) -> bytes
    render_complete_pdf(video_title, language_name, summary, transcript_text) -> bytes
"""

import logging

from fpdf import FPDF
from fpdf.enums import XPos, YPos

logger = logging.getLogger(__name__)

FONT_DIR = "app/assets/fonts"

# language code -> font file stem (fonts downloaded into app/assets/fonts)
FONT_BY_LANGUAGE = {
    "en": "latin",
    "te": "telugu",
    "hi": "devanagari",
    "mr": "devanagari",
    "ta": "tamil",
    "kn": "kannada",
    "ml": "malayalam",
    "bn": "bengali",
    "as": "bengali",  # Assamese uses the Bengali script
    "gu": "gujarati",
    "pa": "gurmukhi",
    "or": "oriya",
    "ur": "arabic",
    "ar": "arabic",
    # Latin-script languages share the base font (covers accented characters)
    "es": "latin", "fr": "latin", "de": "latin", "pt": "latin",
    "it": "latin", "nl": "latin", "tr": "latin", "ru": "latin",
}

FALLBACK_FONT = "latin"


def _font_for_language(language_code: str) -> str:
    if language_code in ("zh",):
        return "notosanssc"
    if language_code == "ja":
        return "notosansjp"
    if language_code == "ko":
        return "notosanskr"
    return FONT_BY_LANGUAGE.get(language_code, FALLBACK_FONT)


class _PDF(FPDF):
    def __init__(self, title: str):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.doc_title = title
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(16, 16, 16)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("latin", "", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 6, "VideoMind Ai", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="L")
        self.ln(2)

    def footer(self):
        self.set_y(-14)
        self.set_font("latin", "", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 8, f"VideoMind Ai  ·  Page {self.page_no()} of {{nb}}", align="C")


def _new_pdf(font_key: str) -> _PDF:
    pdf = _PDF("")
    fallback = f"{FONT_DIR}/{FALLBACK_FONT}.ttf"
    # Latin is always registered — used for headings/footer on every page
    try:
        pdf.add_font(FALLBACK_FONT, "", fallback)
    except RuntimeError:
        pass
    if font_key != FALLBACK_FONT:
        regular = f"{FONT_DIR}/{font_key}.ttf"
        try:
            pdf.add_font(font_key, "", regular)
            # Render Latin characters (technical terms, headings) via fallback
            pdf.set_fallback_fonts([FALLBACK_FONT])
        except RuntimeError:
            logger.warning("Font %s missing; falling back to %s", font_key, FALLBACK_FONT)
            font_key = FALLBACK_FONT
    pdf.set_font(font_key, "", 11)
    pdf.add_page()
    return pdf


def _cover_block(pdf: _PDF, font_key: str, subtitle: str, video_title: str, language_label: str):
    pdf.set_fill_color(238, 242, 255)
    pdf.rect(0, 0, 210, 46, style="F")
    pdf.set_xy(16, 10)

    pdf.set_font("latin", "", 9)
    pdf.set_text_color(99, 102, 241)
    pdf.cell(0, 6, "VIDEOMIND AI", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    pdf.set_font(font_key, "", 17)
    pdf.set_text_color(15, 23, 42)
    pdf.multi_cell(0, 9, subtitle, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.5)

    pdf.set_font(font_key, "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(
        0,
        5.5,
        f"{video_title}\nLanguage: {language_label}",
        new_x=XPos.LMARGIN,
        new_y=YPos.NEXT,
    )
    pdf.set_y(52)


def _section_heading(pdf: _PDF, font_key: str, text: str):
    pdf.ln(3)
    pdf.set_font("latin", "", 12)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 8, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(224, 231, 255)
    pdf.set_line_width(0.4)
    pdf.line(16, pdf.get_y(), 194, pdf.get_y())
    pdf.ln(2.5)
    pdf.set_text_color(30, 41, 59)


def _paragraph(pdf: _PDF, font_key: str, text: str, size: float = 10.5):
    pdf.set_font(font_key, "", size)
    pdf.set_text_color(51, 65, 85)
    pdf.multi_cell(0, 6, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1.6)


def _numbered_list(pdf: _PDF, font_key: str, items):
    pdf.set_font(font_key, "", 10.5)
    pdf.set_text_color(51, 65, 85)
    for i, item in enumerate(items, start=1):
        pdf.set_text_color(79, 70, 229)
        pdf.cell(9, 6, f"{i:>2}.")
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(0, 6, str(item), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)


def _check_list(pdf: _PDF, font_key: str, items):
    pdf.set_font(font_key, "", 10.5)
    for item in items:
        pdf.set_text_color(16, 185, 129)
        pdf.cell(8, 6, "[v]")
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(0, 6, str(item), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)


def _concept_blocks(pdf: _PDF, font_key: str, concepts):
    """concepts: list of {name, explanation} or plain strings."""
    for concept in concepts:
        if isinstance(concept, dict):
            name = concept.get("name", "")
            explanation = concept.get("explanation", "")
        else:
            name = str(concept)
            explanation = ""
        pdf.set_text_color(30, 41, 59)
        pdf.set_font(font_key, "", 10.5)
        pdf.multi_cell(0, 6, name, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        if explanation:
            pdf.set_text_color(100, 116, 139)
            pdf.set_font(font_key, "", 10)
            pdf.multi_cell(0, 5.8, explanation, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1.6)


def _normalize_concepts(raw) -> list:
    normalized = []
    for item in raw or []:
        if isinstance(item, dict):
            normalized.append({"name": item.get("name", ""), "explanation": item.get("explanation", "")})
        elif isinstance(item, str):
            normalized.append({"name": item, "explanation": ""})
    return [c for c in normalized if c["name"]]


def _summary_sections(pdf: _PDF, font_key: str, summary: dict):
    _section_heading(pdf, font_key, "OVERVIEW")
    _paragraph(pdf, font_key, summary.get("overview", ""))

    key_points = summary.get("key_points") or []
    if key_points:
        _section_heading(pdf, font_key, "KEY POINTS")
        _numbered_list(pdf, font_key, key_points)

    concepts = _normalize_concepts(summary.get("important_concepts"))
    if concepts:
        _section_heading(pdf, font_key, "IMPORTANT CONCEPTS")
        _concept_blocks(pdf, font_key, concepts)

    detailed = summary.get("detailed_explanation")
    if detailed:
        _section_heading(pdf, font_key, "DETAILED EXPLANATION")
        for para in detailed.split("\n\n"):
            if para.strip():
                _paragraph(pdf, font_key, para.strip())

    takeaways = summary.get("main_takeaways") or []
    if takeaways:
        _section_heading(pdf, font_key, "MAIN TAKEAWAYS")
        _check_list(pdf, font_key, takeaways)

    if summary.get("conclusion"):
        _section_heading(pdf, font_key, "CONCLUSION")
        _paragraph(pdf, font_key, summary["conclusion"])


def _transcript_section(pdf: _PDF, font_key: str, transcript_text: str):
    _section_heading(pdf, font_key, "TRANSCRIPT")
    for para in transcript_text.split("\n\n"):
        para = para.strip()
        if para:
            _paragraph(pdf, font_key, para)


def _finish(pdf: _PDF) -> bytes:
    pdf.set_text_color(30, 41, 59)
    return bytes(pdf.output())


def safe_filename_part(language_english_name: str) -> str:
    cleaned = "".join(ch for ch in language_english_name if ch.isalnum() or ch in ("-", "_"))
    return cleaned or "Original"


def _length_label(length: str | None) -> str:
    return {"short": "Short", "medium": "Medium", "detailed": "Detailed"}.get(length or "", "Detailed")


def render_summary_pdf(video_title: str, language_code: str, language_name: str, summary: dict, summary_length: str = "detailed") -> bytes:
    font_key = _font_for_language(language_code)
    pdf = _new_pdf(font_key)
    label = _length_label(summary_length)
    pdf.doc_title = f"VideoMind-AI-Summary-{safe_filename_part(language_name)}-{label}"
    _cover_block(pdf, font_key, f"YouTube Video Summary ({label})", video_title, language_name)
    _summary_sections(pdf, font_key, summary)
    return _finish(pdf)


def render_transcript_pdf(video_title: str, language_code: str, language_name: str, transcript_text: str) -> bytes:
    font_key = _font_for_language(language_code)
    pdf = _new_pdf(font_key)
    pdf.doc_title = f"VideoMind-AI-Transcript-{safe_filename_part(language_name)}"
    _cover_block(pdf, font_key, "YouTube Transcript", video_title, language_name)
    _transcript_section(pdf, font_key, transcript_text)
    return _finish(pdf)


def render_complete_pdf(
    video_title: str,
    language_code: str,
    language_name: str,
    summary: dict | None,
    transcript_text: str,
    summary_length: str = "detailed",
) -> bytes:
    font_key = _font_for_language(language_code)
    pdf = _new_pdf(font_key)
    label = _length_label(summary_length)
    pdf.doc_title = f"VideoMind-AI-Complete-{safe_filename_part(language_name)}-{label}"
    _cover_block(pdf, font_key, f"Complete Video Analysis ({label})", video_title, language_name)

    if summary:
        _summary_sections(pdf, font_key, summary)
        pdf.add_page()

    if transcript_text:
        _transcript_section(pdf, font_key, transcript_text)

    return _finish(pdf)
