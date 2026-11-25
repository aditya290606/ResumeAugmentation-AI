"""Surface-form variation for entity spans. The label never changes."""
import re
from typing import List

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
ABBRS = [m[:3].lower() for m in MONTHS]
MONTH_RE = re.compile(rf"\b({'|'.join(MONTHS + [m[:3] for m in MONTHS])})\.?\s+(\d{{4}})\b", re.IGNORECASE)
YEAR_RANGE_RE = re.compile(r"\b(19\d{2}|20\d{2})\s*[-–—to]+\s*(19\d{2}|20\d{2})\b", re.IGNORECASE)
PRESENT_RE = re.compile(r"\b(Present|Current|Ongoing|Till Date)\b", re.IGNORECASE)

COMPANY_SUFFIXES = ["Inc.", "LLC", "Corp.", "Technologies", "Labs", "Solutions", "Systems", "Pvt. Ltd."]

DEGREE_MAP = {
    "b.tech": "Bachelor of Technology",
    "bachelor of technology": "B.Tech",
    "b.e.": "Bachelor of Engineering",
    "bachelor of engineering": "B.E.",
    "m.tech": "Master of Technology",
    "master of technology": "M.Tech",
    "m.sc.": "Master of Science",
    "m.s.": "Master of Science",
    "master of science": "M.Sc.",
    "b.sc.": "Bachelor of Science",
    "b.s.": "Bachelor of Science",
    "bachelor of science": "B.Sc.",
    "b.a.": "Bachelor of Arts",
    "bachelor of arts": "B.A.",
    "mba": "Master of Business Administration",
    "master of business administration": "MBA",
}


def vary_phone(text: str, rng) -> str:
    digits = re.sub(r"\D", "", text)
    if len(digits) == 12 and digits.startswith("91"):
        national = digits[2:]
        prefix = rng.choice(["+91 ", "+91-", "0", ""])
    elif len(digits) == 11 and digits.startswith("1"):
        national = digits[1:]
        prefix = rng.choice(["+1 ", "+1-", "1-", ""])
    elif len(digits) == 10:
        national = digits
        prefix = rng.choice(["+91 ", "+91-", "", ""])
    else:
        return text  # Unknown format, preserve

    formats = [
        lambda n: f"{n[:5]} {n[5:]}",
        lambda n: f"{n[:5]}-{n[5:]}",
        lambda n: f"({n[:3]}) {n[3:6]}-{n[6:]}",
        lambda n: f"{n[:3]}-{n[3:6]}-{n[6:]}",
        lambda n: f"{n[:3]}.{n[3:6]}.{n[6:]}",
        lambda n: n,
    ]
    return prefix + rng.choice(formats)(national)


def vary_date(text: str, rng) -> str:
    # 1. Month-Year replacement
    def repl_month(m):
        raw_name, year = m.group(1), m.group(2)
        idx = ABBRS.index(raw_name[:3].lower())
        style = rng.randrange(5)
        options = [
            f"{MONTHS[idx]} {year}",
            f"{MONTHS[idx][:3]} {year}",
            f"{idx + 1:02d}/{year}",
            f"{year}-{idx + 1:02d}",
            f"{MONTHS[idx][:3]} '{year[2:]}",
        ]
        return options[style]

    out = MONTH_RE.sub(repl_month, text)

    # 2. Year ranges: e.g. 2021 - 2025 -> 2021 to 2025, 2021–2025, '21 - '25
    def repl_year_range(m):
        y1, y2 = m.group(1), m.group(2)
        style = rng.randrange(4)
        if style == 0:
            return f"{y1} - {y2}"
        elif style == 1:
            return f"{y1} to {y2}"
        elif style == 2:
            return f"{y1}–{y2}"
        else:
            return f"'{y1[2:]} - '{y2[2:]}"

    out = YEAR_RANGE_RE.sub(repl_year_range, out)

    # 3. Present variations
    if PRESENT_RE.search(out) and rng.random() < 0.5:
        out = PRESENT_RE.sub(rng.choice(["Present", "Current", "Ongoing", "Till Date"]), out)

    return out


def vary_company(text: str, rng) -> str:
    clean = text.strip()
    for sfx in COMPANY_SUFFIXES:
        if clean.endswith(sfx):
            if rng.random() < 0.5:
                # Swap suffix
                new_sfx = rng.choice([s for s in COMPANY_SUFFIXES if s != sfx])
                return clean[:-len(sfx)].strip() + " " + new_sfx
            else:
                # Strip suffix
                return clean[:-len(sfx)].strip()
    # Add a suffix if none present
    if " " in clean and len(clean.split()) <= 3 and rng.random() < 0.6:
        return f"{clean} {rng.choice(COMPANY_SUFFIXES)}"
    return text


def vary_degree(text: str, rng) -> str:
    lower = text.lower()
    for key, val in DEGREE_MAP.items():
        if key in lower:
            pattern = re.compile(re.escape(key), re.IGNORECASE)
            return pattern.sub(val, text, count=1)
    return text


class EntityAugmenter:
    def __init__(self, cfg, rng):
        self.cfg = cfg
        self.rng = rng

    def augment(self, resume):
        ops = []
        for section in resume.sections:
            for item in section.items:
                for seg in item.segments:
                    if seg.label == "PHONE" and self.rng.random() < self.cfg.phone_p:
                        new = vary_phone(seg.text, self.rng)
                        if new != seg.text:
                            seg.text = new
                            ops.append("phone_format")
                    elif seg.label == "DATE" and self.rng.random() < self.cfg.date_p:
                        new = vary_date(seg.text, self.rng)
                        if new != seg.text:
                            seg.text = new
                            ops.append("date_format")
                    elif seg.label == "COMPANY" and self.rng.random() < self.cfg.company_suffix_p:
                        new = vary_company(seg.text, self.rng)
                        if new != seg.text:
                            seg.text = new
                            ops.append("company_variation")
                    elif seg.label == "DEGREE" and self.rng.random() < self.cfg.degree_p:
                        new = vary_degree(seg.text, self.rng)
                        if new != seg.text:
                            seg.text = new
                            ops.append("degree_variation")
        return resume, ops
