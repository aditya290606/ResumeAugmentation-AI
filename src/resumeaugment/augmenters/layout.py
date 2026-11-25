"""Structural/layout variation: headers, bullets, separators, section order, skill formatting."""
from ..render import LayoutSettings
from ..schema import Item, Segment

HEADER_BANK = {
    "contact": [
        "Contact", "Contact Information", "Personal Details",
        "Contact Info", "Personal Information", "Reach Me At",
    ],
    "summary": [
        "Summary", "Professional Summary", "Profile", "About Me",
        "Objective", "Career Objective", "Executive Summary", "Professional Profile",
    ],
    "experience": [
        "Experience", "Work Experience", "Professional Experience",
        "Employment History", "Work History", "Career History", "Relevant Experience",
    ],
    "education": [
        "Education", "Academic Background", "Education & Qualifications",
        "Academic History", "Educational Qualifications", "Academics",
    ],
    "skills": [
        "Skills", "Technical Skills", "Core Competencies", "Key Skills",
        "Skill Set", "Technologies", "Tech Stack", "Tools & Technologies",
    ],
    "projects": [
        "Projects", "Personal Projects", "Key Projects",
        "Notable Projects", "Project Experience", "Portfolio Projects",
    ],
    "certifications": [
        "Certifications", "Licenses & Certifications", "Certificates",
        "Professional Certifications", "Courses & Certifications",
    ],
    "achievements": [
        "Achievements", "Honors & Awards", "Key Achievements", "Awards",
    ],
    "publications": [
        "Publications", "Papers & Publications", "Research Papers",
    ],
}

BULLETS = ["•", "-", "*", "◦", "▪", "–", "→"]
CONTACT_SEPARATORS = [" | ", ", ", " • ", " / ", " · "]
MOVABLE = {"experience", "education", "skills", "projects", "certifications", "achievements"}


class LayoutAugmenter:
    def __init__(self, cfg, rng):
        self.cfg = cfg
        self.rng = rng

    def augment(self, resume):
        cfg, rng = self.cfg, self.rng
        ops = []

        is_multiline_contact = rng.random() < cfg.contact_multiline_p
        if is_multiline_contact:
            ops.append("contact_multiline")

        # Determine header styling
        header_upper = rng.random() < cfg.header_upper_p
        if rng.random() < cfg.header_style_p:
            header_style = rng.choice(["underlined", "bracketed", "dashed", "upper"])
            ops.append(f"header_style_{header_style}")
        else:
            header_style = "upper" if header_upper else "title"
            if header_upper:
                ops.append("header_upper")

        # Determine bullet styling
        if rng.random() < cfg.bullet_style_p:
            bullet_style = rng.choice(["symbol", "numbered", "none"])
            if bullet_style != "symbol":
                ops.append(f"bullet_{bullet_style}")
        else:
            bullet_style = "symbol"

        bullet_symbol = rng.choice(BULLETS)

        settings = LayoutSettings(
            bullet=bullet_symbol,
            contact_separator=rng.choice(CONTACT_SEPARATORS),
            header_upper=header_upper,
            contact_multiline=is_multiline_contact,
            header_style=header_style,
            bullet_style=bullet_style,
        )

        # Header rewrites
        for section in resume.sections:
            if section.key in HEADER_BANK and rng.random() < cfg.header_rename_p:
                new_hdr = rng.choice(HEADER_BANK[section.key])
                if new_hdr != section.header:
                    section.header = new_hdr
                    ops.append("header_rename")

        # Section reordering
        if rng.random() < cfg.reorder_sections_p:
            positions = [i for i, s in enumerate(resume.sections) if s.key in MOVABLE]
            if len(positions) > 1:
                shuffled = [resume.sections[i] for i in positions]
                rng.shuffle(shuffled)
                for pos, sec in zip(positions, shuffled):
                    resume.sections[pos] = sec
                ops.append("section_reorder")

        # Skills inline vs list formatting
        for section in resume.sections:
            if section.key == "skills" and len(section.items) > 1 and rng.random() < cfg.merge_skills_p:
                sep = rng.choice([", ", " | ", " • "])
                segs = []
                for i, item in enumerate(section.items):
                    if i:
                        segs.append(Segment(sep, None))
                    segs.extend(item.segments)
                section.items = [Item(segments=segs, bullet=False)]
                ops.append("skills_inline")

        return resume, settings, ops
