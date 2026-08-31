"""Transcript chunking utilities for long-transcript summarization.

Splits text at natural boundaries (paragraphs -> sentences -> words) so the
AI service never sends blindly-cut mid-word chunks to the model.
Adds small overlaps between chunks to preserve context at boundaries.
"""

import re

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
_PARAGRAPH_SPLIT = re.compile(r"\n{2,}")

# Safe chunk size: ~3000 chars (~750 tokens) leaving room for system prompt + output
DEFAULT_MAX_CHARS = 6000
DEFAULT_OVERLAP_CHARS = 300


def _split_oversized_sentence(sentence: str, max_chars: int) -> list[str]:
    """Hard-split a sentence that alone exceeds max_chars, at word boundaries."""
    words = sentence.split()
    parts: list[str] = []
    current: list[str] = []

    for word in words:
        candidate_len = sum(len(w) + 1 for w in current) + len(word)
        if current and candidate_len > max_chars:
            parts.append(" ".join(current))
            current = [word]
        else:
            current.append(word)

    if current:
        parts.append(" ".join(current))
    return parts


def _split_paragraph(paragraph: str, max_chars: int) -> list[str]:
    """Split a paragraph into sentence-sized pieces under max_chars."""
    if len(paragraph) <= max_chars:
        return [paragraph]

    pieces: list[str] = []
    current = ""
    for sentence in _SENTENCE_SPLIT.split(paragraph):
        if not sentence.strip():
            continue
        if len(sentence) > max_chars:
            if current.strip():
                pieces.append(current.strip())
                current = ""
            pieces.extend(_split_oversized_sentence(sentence.strip(), max_chars))
        elif len(current) + len(sentence) + 1 > max_chars:
            if current.strip():
                pieces.append(current.strip())
            current = sentence
        else:
            current = f"{current} {sentence}".strip()
    if current.strip():
        pieces.append(current.strip())
    return pieces


def _merge_small(pieces: list[str], min_chars: int, max_chars: int) -> list[str]:
    merged: list[str] = []
    for piece in pieces:
        if merged and len(merged[-1]) < min_chars and len(merged[-1]) + len(piece) + 2 <= max_chars:
            merged[-1] = f"{merged[-1]}\n\n{piece}"
        else:
            merged.append(piece)
    return merged


def split_text_into_chunks(
    text: str,
    max_chars: int = DEFAULT_MAX_CHARS,
    min_chars: int = 1000,
    overlap_chars: int = DEFAULT_OVERLAP_CHARS,
) -> list[str]:
    """Split transcript text into chunks under `max_chars`.

    Prefers paragraph boundaries, then sentence boundaries, then word
    boundaries. Trailing chunks smaller than `min_chars` are merged with the
    previous chunk. Adjacent chunks have a small overlap to preserve context.
    """
    if not text or not text.strip():
        return []
    if len(text) <= max_chars:
        return [text.strip()]

    paragraphs = [p.strip() for p in _PARAGRAPH_SPLIT.split(text) if p.strip()]
    if not paragraphs:
        paragraphs = _split_paragraph(text, max_chars)
        return _merge_small(pieces=paragraphs, min_chars=min_chars, max_chars=max_chars)

    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        if len(paragraph) > max_chars:
            if current.strip():
                chunks.append(current.strip())
                current = ""
            sub_chunks = _merge_small(
                pieces=_split_paragraph(paragraph, max_chars),
                min_chars=min_chars,
                max_chars=max_chars,
            )
            for sc in sub_chunks:
                chunks.append(sc)
            continue
        if len(current) + len(paragraph) + 2 > max_chars:
            if current.strip():
                chunks.append(current.strip())
            current = paragraph
        else:
            current = f"{current}\n\n{paragraph}".strip()

    if current.strip():
        chunks.append(current.strip())

    # Merge small trailing chunks
    if chunks and len(chunks[-1]) < min_chars and len(chunks) > 1:
        chunks[-2] = f"{chunks[-2]}\n\n{chunks[-1]}"
        chunks.pop()

    # Add overlap: each chunk (except first) includes the last `overlap_chars` chars of the previous chunk
    if overlap_chars > 0 and len(chunks) > 1:
        overlapped: list[str] = [chunks[0]]
        for i in range(1, len(chunks)):
            prev = chunks[i - 1]
            overlap_text = prev[-overlap_chars:] if len(prev) > overlap_chars else prev
            overlapped.append(overlap_text + "\n\n" + chunks[i])
        chunks = overlapped

    return chunks


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token for English text."""
    return max(1, len(text) // 4)