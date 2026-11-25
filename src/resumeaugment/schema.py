"""Resume data model and a lightweight markup format for authoring base resumes.

Markup example:
    === r001 ===
    ## [contact] Contact
    <NAME>Priya Sharma</NAME>
    ## [experience] Experience
    - <DESIGNATION>ML Intern</DESIGNATION> at <COMPANY>Acme</COMPANY>, <DATE>Jun 2024 - Aug 2024</DATE>
    - Built a classifier that improved accuracy by 18%.

`<LABEL>...</LABEL>` marks an entity span. Untagged text is "O" (non-entity).
`## [key] Header` starts a section; `- ` starts a bullet item; other lines are plain items.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

ENTITY_LABELS = (
    "NAME", "EMAIL", "PHONE", "LOCATION", "DESIGNATION",
    "COMPANY", "COLLEGE", "DEGREE", "SKILL", "DATE",
    "LINK", "CERTIFICATION",
)

TAG_RE = re.compile(r"<(" + "|".join(ENTITY_LABELS) + r")>(.*?)</\1>")
RESUME_RE = re.compile(r"^===\s*(\S+)\s*===$")
HEADER_RE = re.compile(r"^##\s*\[(\w+)\]\s*(.*)$")


@dataclass
class Segment:
    text: str
    label: Optional[str] = None  # None means non-entity text


@dataclass
class Item:
    segments: List[Segment] = field(default_factory=list)
    bullet: bool = False


@dataclass
class Section:
    key: str       # e.g. "contact", "experience" (drives header bank and reordering)
    header: str    # header text as rendered
    items: List[Item] = field(default_factory=list)


@dataclass
class Resume:
    resume_id: str
    sections: List[Section] = field(default_factory=list)


def _add_text(segments: List[Segment], text: str) -> None:
    text = text.strip()
    if text:
        segments.append(Segment(text, None))


def parse_segments(line: str) -> List[Segment]:
    segments: List[Segment] = []
    pos = 0
    for m in TAG_RE.finditer(line):
        _add_text(segments, line[pos:m.start()])
        segments.append(Segment(m.group(2).strip(), m.group(1)))
        pos = m.end()
    _add_text(segments, line[pos:])
    return segments


def parse_markup(text: str) -> List[Resume]:
    resumes: List[Resume] = []
    current: Optional[Resume] = None
    section: Optional[Section] = None
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("//"):
            continue
        m = RESUME_RE.match(line)
        if m:
            current = Resume(resume_id=m.group(1))
            resumes.append(current)
            section = None
            continue
        m = HEADER_RE.match(line)
        if m:
            if current is None:
                raise ValueError("Section header found before any resume")
            section = Section(key=m.group(1), header=m.group(2).strip())
            current.sections.append(section)
            continue
        if current is None or section is None:
            raise ValueError(f"Content outside a section: {line!r}")
        bullet = line.startswith("- ")
        body = line[2:] if bullet else line
        section.items.append(Item(segments=parse_segments(body), bullet=bullet))
    return resumes


def load_resumes(path) -> List[Resume]:
    return parse_markup(Path(path).read_text(encoding="utf-8"))
