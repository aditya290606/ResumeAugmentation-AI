from collections import Counter
from pathlib import Path
import random
import re
import pytest

from resumeaugment import AugmentConfig, ResumeAugmenter
from resumeaugment.augmenters.entities import vary_date, vary_phone, vary_company, vary_degree
from resumeaugment.augmenters.llm import LLMTextAugmenter
from resumeaugment.render import render, LayoutSettings
from resumeaugment.schema import load_resumes, parse_markup, Item, Segment
from resumeaugment.utils import bio_to_spans
from resumeaugment.export import (
    write_jsonl, write_conll, write_huggingface, write_spacy_json, write_dataset_splits
)
from resumeaugment.validator import (
    validate_dataset, generate_validation_summary_frame, write_validation_reports
)

DATA = Path(__file__).resolve().parent.parent / "data" / "base_resumes.md"
SURFACE_STABLE = {"NAME", "EMAIL", "SKILL", "COLLEGE"}


@pytest.fixture(scope="module")
def resumes():
    return load_resumes(DATA)


def label_counts(resume):
    return Counter(seg.label for s in resume.sections for it in s.items
                   for seg in it.segments if seg.label)


def entity_texts(tokens, ents):
    return [(label, " ".join(tokens[start:end]))
            for start, end, label in sorted(bio_to_spans(ents))]


def test_parse_markup_tags():
    doc = parse_markup("=== x ===\n## [skills] Skills\n- <SKILL>Python</SKILL> is great\n")[0]
    item = doc.sections[0].items[0]
    assert [(s.text, s.label) for s in item.segments] == [("Python", "SKILL"), ("is great", None)]
    assert item.bullet is True


def test_render_alignment(resumes):
    for r in resumes:
        rd = render(r)
        assert len(rd.tokens) == len(rd.ents)
        # Check character spans match exact substring in text
        for sp in rd.spans:
            extracted = rd.text[sp["start"]:sp["end"]]
            assert extracted == sp["text"]


def test_render_multiline_contact(resumes):
    r = resumes[0]
    rd_single = render(r, LayoutSettings(contact_multiline=False))
    rd_multi = render(r, LayoutSettings(contact_multiline=True))
    assert len(rd_multi.tokens) == len(rd_multi.ents)
    assert rd_multi.text.count("\n") > rd_single.text.count("\n")


def test_render_header_styles(resumes):
    r = resumes[0]
    for style in ["upper", "bracketed", "dashed", "underlined", "title"]:
        rd = render(r, LayoutSettings(header_style=style))
        assert len(rd.tokens) == len(rd.ents)
        assert len(rd.text) > 0


def test_augmented_examples_keep_entity_counts(resumes):
    aug = ResumeAugmenter(AugmentConfig(variants_per_resume=10, seed=1, use_nlpaug=False))
    for r in resumes[:3]:
        for ex in aug.generate(r):
            assert len(ex.tokens) == len(ex.ents)
            got = Counter(label for _, _, label in bio_to_spans(ex.ents))
            assert got == label_counts(r), ex.example_id


def test_stable_entities_unchanged(resumes):
    # With company/degree variations disabled, stable entities must be strictly identical
    aug = ResumeAugmenter(AugmentConfig(
        variants_per_resume=10, seed=2, use_nlpaug=False,
        company_suffix_p=0.0, degree_p=0.0
    ))
    for r in resumes[:3]:
        base = render(r)
        original = {(l, t) for l, t in entity_texts(base.tokens, base.ents) if l in SURFACE_STABLE}
        for ex in aug.generate(r):
            got = {(l, t) for l, t in entity_texts(ex.tokens, ex.ents) if l in SURFACE_STABLE}
            assert got == original, ex.example_id


def test_variants_are_unique_and_varied(resumes):
    aug = ResumeAugmenter(AugmentConfig(variants_per_resume=10, seed=3, use_nlpaug=False))
    examples = aug.generate(resumes[0])
    texts = [ex.text for ex in examples]
    assert len(texts) == len(set(texts))
    assert len(examples) > 5


def test_phone_variants_keep_digits():
    rng = random.Random(0)
    for _ in range(50):
        out = vary_phone("+91 98480 12345", rng)
        assert "".join(c for c in out if c.isdigit()) in {"919848012345", "9848012345", "09848012345"}


def test_date_variants_keep_years():
    rng = random.Random(0)
    for _ in range(20):
        out = vary_date("Jun 2024 - Aug 2024", rng)
        assert ("2024" in out or "'24" in out)


def test_company_and_degree_variation():
    rng = random.Random(42)
    c_out = vary_company("Acme Analytics", rng)
    assert "Acme Analytics" in c_out

    d_out = vary_degree("B.Tech in Computer Science", rng)
    assert "Computer Science" in d_out


def test_llm_mask_and_unmask_integrity():
    rng = random.Random(42)
    cfg = AugmentConfig()
    llm = LLMTextAugmenter(cfg, rng)

    item = Item(
        segments=[
            Segment("Built an NLP model for", None),
            Segment("Acme Analytics", "COMPANY"),
            Segment("using", None),
            Segment("Python", "SKILL"),
        ],
        bullet=True,
    )
    masked, vault = llm.mask_item(item)
    assert "[[ENT_0]]" in masked
    assert "[[ENT_1]]" in masked

    unmasked = llm.unmask_item(masked, vault, item.bullet)
    assert len(unmasked.segments) == 4
    assert unmasked.segments[1].label == "COMPANY"
    assert unmasked.segments[1].text == "Acme Analytics"
    assert unmasked.segments[3].label == "SKILL"
    assert unmasked.segments[3].text == "Python"


def test_export_formats(tmp_path, resumes):
    aug = ResumeAugmenter(AugmentConfig(variants_per_resume=3, seed=5, use_nlpaug=False))
    examples = aug.generate(resumes[0])

    jsonl_f = tmp_path / "test.jsonl"
    write_jsonl(examples, jsonl_f)
    assert jsonl_f.exists()

    conll_f = tmp_path / "test.conll"
    write_conll(examples, conll_f)
    assert conll_f.exists()
    assert "-DOCSTART-" in conll_f.read_text(encoding="utf-8")

    hf_f = tmp_path / "test_hf.json"
    write_huggingface(examples, hf_f)
    assert hf_f.exists()

    spacy_f = tmp_path / "test_spacy.json"
    write_spacy_json(examples, spacy_f)
    assert spacy_f.exists()

    splits = write_dataset_splits(examples, tmp_path / "splits")
    assert splits["train"] > 0


def test_dataset_validation(tmp_path, resumes):
    aug = ResumeAugmenter(AugmentConfig(variants_per_resume=4, seed=42, use_nlpaug=False))
    examples = aug.generate(resumes[0])
    assert len(examples) >= 4

    report = validate_dataset(examples)
    assert report["total_records"] == len(examples)
    assert report["data_integrity_score"] == 100.0
    assert report["content_consistency_score"] == 100.0
    assert report["information_preservation_rate"] == 100.0
    assert report["overall_quality_score"] >= 90.0
    assert report["status"] == "PASSED"

    # Test report exports
    df = generate_validation_summary_frame(report)
    assert len(df) >= 7

    paths = write_validation_reports(report, tmp_path / "validation")
    assert paths["json"].exists()
    assert paths["csv"].exists()
