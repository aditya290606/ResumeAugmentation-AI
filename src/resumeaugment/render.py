"""Render a structured Resume to text plus token-level IOB tags and character spans.

Labels are attached to tokens at render time, so any structural change made
before rendering (reordering, header rewrites, separators) can never misalign
entity labels with the text.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from .schema import Resume, Segment
from .utils import bio_to_spans

NO_SPACE_BEFORE = {",", ";", ":", ".", ")", "]", "}"}
Word = Tuple[str, str]


@dataclass
class LayoutSettings:
    bullet: str = "•"
    contact_separator: str = " | "
    header_upper: bool = False
    contact_multiline: bool = False
    header_style: str = "title"  # "title", "upper", "underlined", "bracketed", "dashed"
    bullet_style: str = "symbol"  # "symbol", "numbered", "none"


@dataclass
class Rendered:
    text: str
    tokens: List[str]
    ents: List[str]  # IOB tags, aligned 1:1 with tokens
    spans: List[dict] = field(default_factory=list)  # Char- and token-level entity spans


def _segment_words(seg: Segment) -> List[Word]:
    words = seg.text.split()
    if seg.label is None:
        return [(w, "O") for w in words]
    return [(w, ("B-" if i == 0 else "I-") + seg.label) for i, w in enumerate(words)]


def _format_header(header: str, settings: LayoutSettings) -> str:
    if settings.header_upper or settings.header_style == "upper":
        return header.upper()
    if settings.header_style == "bracketed":
        return f"[ {header} ]"
    if settings.header_style == "dashed":
        return f"--- {header} ---"
    return header


def render(resume: Resume, settings: Optional[LayoutSettings] = None) -> Rendered:
    s = settings or LayoutSettings()
    lines: List[List[Word]] = []

    for section in resume.sections:
        if section.header:
            hdr_text = _format_header(section.header, s)
            lines.append([(w, "O") for w in hdr_text.split()])
            if s.header_style == "underlined":
                rule_len = max(len(hdr_text), 12)
                lines.append([(w, "O") for w in ("-" * rule_len).split()])

        if section.key == "contact":
            if s.contact_multiline:
                for item in section.items:
                    line = []
                    for seg in item.segments:
                        line += _segment_words(seg)
                    if line:
                        lines.append(line)
            else:
                line = []
                for i, item in enumerate(section.items):
                    if i:
                        line += [(w, "O") for w in s.contact_separator.split()]
                    for seg in item.segments:
                        line += _segment_words(seg)
                if line:
                    lines.append(line)
            continue

        for idx, item in enumerate(section.items):
            line = []
            if item.bullet and s.bullet_style != "none":
                if s.bullet_style == "numbered":
                    line.append((f"{idx + 1}.", "O"))
                elif s.bullet:
                    line.append((s.bullet, "O"))
            for seg in item.segments:
                line += _segment_words(seg)
            if line:
                lines.append(line)

    # Flatten tokens and entity tags
    tokens = [w for line in lines for w, _ in line]
    ents = [t for line in lines for _, t in line]
    assert len(tokens) == len(ents)

    # Reconstruct text and track exact character offsets per token
    token_offsets: List[Tuple[int, int]] = []
    text_chunks: List[str] = []
    curr_char = 0

    for line_idx, line in enumerate(lines):
        if line_idx > 0:
            text_chunks.append("\n")
            curr_char += 1

        line_tok_idx = 0
        for w, _ in line:
            needs_space = (line_tok_idx > 0 and w not in NO_SPACE_BEFORE)
            if needs_space:
                text_chunks.append(" ")
                curr_char += 1
            tok_start = curr_char
            text_chunks.append(w)
            curr_char += len(w)
            tok_end = curr_char
            token_offsets.append((tok_start, tok_end))
            line_tok_idx += 1

    text = "".join(text_chunks)
    assert len(token_offsets) == len(tokens)

    # Compute character-level spans from BIO tags
    spans: List[dict] = []
    for s_idx, e_idx, label in sorted(bio_to_spans(ents)):
        start_char = token_offsets[s_idx][0]
        end_char = token_offsets[e_idx - 1][1]
        spans.append({
            "start": start_char,
            "end": end_char,
            "start_token": s_idx,
            "end_token": e_idx,
            "label": label,
            "text": text[start_char:end_char],
        })

    return Rendered(text=text, tokens=tokens, ents=ents, spans=spans)
