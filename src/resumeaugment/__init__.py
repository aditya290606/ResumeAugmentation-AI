"""ResumeAugment AI: entity-preserving resume augmentation for parser robustness."""
from .config import AugmentConfig
from .pipeline import ResumeAugmenter, Example
from .render import render, Rendered, LayoutSettings
from .schema import Resume, Section, Item, Segment, load_resumes, parse_markup, ENTITY_LABELS
from .export import (
    write_jsonl, to_frame, entity_summary, op_summary,
    write_docbin, write_conll, write_huggingface, write_spacy_json, write_dataset_splits,
)

from .generators import (
    PromptResumeGenerator,
    rewrite_persona,
    generate_executive_brief,
    extract_text_from_file,
    match_job_description,
    anonymize_resume_text,
    apply_locale_formatting,
    compute_word_diff,
)

from .validator import (
    validate_dataset,
    generate_validation_summary_frame,
    write_validation_reports,
)

__all__ = [
    "AugmentConfig",
    "ResumeAugmenter",
    "Example",
    "render",
    "Rendered",
    "LayoutSettings",
    "Resume",
    "Section",
    "Item",
    "Segment",
    "load_resumes",
    "parse_markup",
    "ENTITY_LABELS",
    "write_jsonl",
    "to_frame",
    "entity_summary",
    "op_summary",
    "write_docbin",
    "write_conll",
    "write_huggingface",
    "write_spacy_json",
    "write_dataset_splits",
    "validate_dataset",
    "generate_validation_summary_frame",
    "write_validation_reports",
    "PromptResumeGenerator",
    "rewrite_persona",
    "generate_executive_brief",
    "extract_text_from_file",
    "match_job_description",
    "anonymize_resume_text",
    "apply_locale_formatting",
    "compute_word_diff",
]
