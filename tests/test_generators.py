import pytest
from resumeaugment.generators import (
    PromptResumeGenerator,
    rewrite_persona,
    generate_executive_brief,
    extract_text_from_file,
    match_job_description,
    anonymize_resume_text,
    apply_locale_formatting,
    compute_word_diff
)
from resumeaugment.schema import parse_markup


def test_prompt_resume_generator():
    gen = PromptResumeGenerator()
    markup = gen.generate("Senior Machine Learning Engineer with PyTorch", "test_p01")
    assert "=== test_p01 ===" in markup
    assert "<SKILL>" in markup
    resumes = parse_markup(markup)
    assert len(resumes) == 1
    assert resumes[0].resume_id == "test_p01"


def test_persona_rewriter():
    bullet = "Built a distributed cache layer with Redis."
    lead_bullet = rewrite_persona(bullet, "tech_lead")
    assert len(lead_bullet) > len(bullet)
    assert "Redis" in lead_bullet

    exec_bullet = rewrite_persona(bullet, "executive")
    assert "Redis" in exec_bullet


def test_executive_brief():
    profile = {
        "candidate": {"name": "Priya Sharma", "email": "p@test.com"},
        "skills": ["Python", "PyTorch", "Docker"],
        "experience": [{"designation": "ML Engineer", "company": "Acme"}],
        "education": [{"degree": "B.Tech Computer Science"}]
    }
    brief = generate_executive_brief(profile, "Sample raw text")
    assert len(brief["executive_summary_bullets"]) == 3
    assert "Priya Sharma" in brief["executive_summary_bullets"][0]


def test_document_parser_txt():
    content = b"Candidate Name\nSoftware Engineer\nPython, Docker"
    extracted = extract_text_from_file("resume.txt", content)
    assert "Software Engineer" in extracted


def test_jd_matcher():
    jd = "Looking for a Senior Python Developer with Docker, AWS, and PostgreSQL experience."
    skills = ["Python", "Docker", "PostgreSQL", "React"]
    result = match_job_description(jd, skills)
    assert result["fit_score"] > 60
    assert "Python" in result["matched_skills"]
    assert "Docker" in result["matched_skills"]


def test_anonymizer():
    text = "Priya Sharma, priya@mail.com, 9848012345, Lakeside Institute"
    entities = {
        "NAME": ["Priya Sharma"],
        "COLLEGE": ["Lakeside Institute"]
    }
    anonymized = anonymize_resume_text(text, entities)
    assert "Priya Sharma" not in anonymized
    assert "[CANDIDATE_ANONYMOUS]" in anonymized


def test_locale_formatting():
    text = "Experience\nSoftware Engineer\nEducation\nB.Tech"
    us_out = apply_locale_formatting(text, "US")
    assert "GPA:" in us_out

    eu_out = apply_locale_formatting(text, "EU")
    assert "LANGUAGES" in eu_out


def test_word_diff():
    orig = "Built a text classification model with spaCy"
    aug = "Engineered a text classification model using spaCy"
    diff = compute_word_diff(orig, aug)
    assert len(diff) > 0
    words = [d["word"] for d in diff]
    assert "classification" in words

