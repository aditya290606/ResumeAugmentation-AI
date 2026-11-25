# ResumeAugment AI: Resume Parsing Data Augmenter

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![spaCy](https://img.shields.io/badge/spaCy-3.8+-09A3D5.svg)](https://spacy.io/)
[![nlpaug](https://img.shields.io/badge/nlpaug-1.1+-green.svg)](https://github.com/makcedward/nlpaug)
[![Pandas](https://img.shields.io/badge/pandas-2.0+-150458.svg)](https://pandas.pydata.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC.svg)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Domain:** HR & Recruiting  
**Problem Statement:** Resume-parsing models trained on a narrow set of formats generalize poorly to real-world layouts, diverse phrasing, and varied surface representations. Differences in section structure, formatting, terminology, and phrasing create critical challenges for automated parsing.  
**Solution:** ResumeAugment AI provides an end-to-end entity-preserving Generative AI and NLP data augmentation pipeline using **NLPAug**, **spaCy**, and **Pandas** that systematically generates controlled structural and wording variations from existing resume data, hardening parsing models to achieve high accuracy on unseen layouts.

---

## Objectives & Bloom's Taxonomy Mapping

| # | Project Objective | Bloom's Taxonomy Level | Implementation in ResumeAugment AI |
|---|---|---|---|
| **1** | **Analyze Resume Dataset Requirements** | **Analyze** | Analyzed 10 base resume profiles, 10 NER entity classes, and identified key real-world layout/phrasing failure modes in [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md). |
| **2** | **Implement Resume Text Augmentation** | **Apply** | Implemented 60+ action verb substitutions, NLPAug WordNet synonym replacement, OCR typos, and entity surface variations (phone, date, degree, company) in [`src/resumeaugment/augmenters/text.py`](src/resumeaugment/augmenters/text.py). |
| **3** | **Implement Resume Structural Augmentation** | **Apply** | Developed section reordering, synonymous header renaming, casing transformations, bullet styles, and contact banner formatting in [`src/resumeaugment/augmenters/layout.py`](src/resumeaugment/augmenters/layout.py). |
| **4** | **Develop Automated Augmentation Pipeline** | **Create** | Engineered reusable, seed-controlled Python pipeline orchestrator (`ResumeAugmenter`) combining NLPAug, spaCy, and Pandas with CLI and FastAPI in [`src/resumeaugment/pipeline.py`](src/resumeaugment/pipeline.py). |
| **5** | **Validate and Prepare Augmented Data** | **Evaluate** | Built multi-dimensional quality engine evaluating Content Consistency, Structural Diversity, Data Integrity, and Entity Preservation in [`src/resumeaugment/validator.py`](src/resumeaugment/validator.py). |

---

## Project Milestones

1. **Milestone 1 — Resume Dataset Analysis & Pipeline Setup**
   - Comprehensive analysis of resume dataset, structural/text variation assessment, environment setup, and pipeline specification ([`docs/SPECIFICATION.md`](docs/SPECIFICATION.md)).
2. **Milestone 2 — Resume Text & Structural Augmentation**
   - Implementation of non-entity wording transformations and structural layout permutations with zero entity label drift.
3. **Milestone 3 — Augmented Resume Dataset Generation & Validation**
   - Execution of augmentation across base profiles, generation of organized records, and multi-dimensional validation summaries ([`output/validation_summary.csv`](output/validation_summary.csv)).
4. **Milestone 4 — Model-Ready Dataset, Testing & Documentation**
   - Delivery of standardized formats (JSONL, CoNLL, spaCy DocBin, HuggingFace), 21 automated unit tests, generalization benchmark (+84.2% F1), and interactive web studio.

---

## Four Official Project Deliverables

| Deliverable | Description | Location / Artifact |
|---|---|---|
| **1. Resume Dataset & Augmentation Specification** | Comprehensive dataset analysis, variation taxonomy, augmentation requirements, environment setup, and initial pipeline design. | [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) |
| **2. Resume Text & Structural Augmentation Pipeline** | Functional NLPAug, spaCy, and Pandas pipeline implementing controlled wording and structural variations in resume data. | [`src/resumeaugment/`](src/resumeaugment/) & [`scripts/run_augment.py`](scripts/run_augment.py) |
| **3. Augmented Resume Dataset & Validation Summaries** | Generated and organized resume records accompanied by automated validation summaries (Consistency, Diversity, Integrity, Preservation). | [`output/augmented.jsonl`](output/augmented.jsonl), [`output/validation_summary.csv`](output/validation_summary.csv), [`output/validation_report.json`](output/validation_report.json) |
| **4. Model-Ready Pipeline & Demonstration** | Standardized downstream formats (`train.spacy`, `dataset.conll`, `huggingface_dataset.json`), empirical evaluation, technical documentation, and full interactive UI. | [`run_demo.py`](run_demo.py), [`server.py`](server.py), [`output/splits/`](output/splits/) |

---

## Dataset Validation & Quality Evaluation Gate (95.0% Overall Score)

The automated validation suite (`scripts/validate_dataset.py`) verifies every generated record before model ingestion:

| Evaluation Dimension | Metric / Target | Result | Status |
|---|---|---|---|
| **Data Integrity** | BIO tag sequencing & exact char-offset alignment | **100.0%** (0 violations) | **PASSED** |
| **Content Consistency** | Semantic meaning & non-empty entity spans | **100.0%** | **PASSED** |
| **Information Preservation** | Zero label drift across entity categories | **100.0%** | **PASSED** |
| **Structural Diversity Index** | Shannon entropy of layouts & unique section orders | **75.0%** (10 unique layouts) | **PASSED** |
| **Overall Quality Gate** | Multi-dimension weighted score (Target >= 90.0%) | **95.0%** | **PASSED** |

---

## Architecture & Augmentation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ Base Resumes (Lightweight Markup with Labeled Entity Spans) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Entity Surface Augmenter                                 │
│    • Phone variations: International, US, Indian, dashes,   │
│      dots, parentheses (digits preserved 100%)              │
│    • Date variations: Month-Year, ranges, 'Present', ISO    │
│    • Organization suffixes: Inc., LLC, Technologies, Corp   │
│    • Degree expansions: B.Tech <-> Bachelor of Technology   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Text & Wording Augmenter (Non-Entity Text Only)          │
│    • 60+ curated action verbs across technical & executive  │
│    • Contextual/WordNet synonym replacement via nlpaug      │
│    • Keyboard neighbor and OCR confusion typos (l/1, o/0)   │
│    • Bullet transitional prefixes & punctuation variation   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Generative AI / LLM Rephraser                            │
│    • Entity masking with unique placeholders ([[ENT_0]])    │
│    • Tone conditioning: Concise, Metric-Driven, Technical   │
│    • Guaranteed zero-drift entity unmasking                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Layout & Structural Augmenter                            │
│    • Section header bank synonyms & casing (UPPER/Title)    │
│    • Header decorations: Underlined, bracketed, dashed      │
│    • Multi-line contact vs. single-line banner format       │
│    • Section reordering (experience, education, skills)     │
│    • Bullet styles: Symbols (•, -, *), numbered, or none    │
│    • Skills list vs. inline comma/pipe formatting           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Exact Alignment Renderer                                 │
│    • Labels attached to tokens at render time               │
│    • Exact character-level start/end offset calculation     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Multi-Format Exporters                                   │
│    • JSONL (tokens, IOB tags, exact char spans, ops)        │
│    • spaCy DocBin (`train.spacy`)                           │
│    • CoNLL-2003 (`dataset.conll`)                           │
│    • Hugging Face Datasets JSON (`ner_tags` + ID mapping)   │
│    • Prodigy / Label Studio Char-Offset JSON                │
│    • Pandas CSV Summaries & Leakage-Free Train/Val/Test     │
└─────────────────────────────────────────────────────────────┘
```

> **Key Design Invariant:** Entity labels are anchored at render time. Augmenters never alter the semantic label of an entity. By construction, reordering, rewording, or layout shifting can never misalign an entity with its text.

---

## Empirical Benchmark: Generalization on Unseen Layouts

To evaluate real-world parser robustness, a spaCy NER model was trained on **original resumes only** vs. **ResumeAugment AI augmented data**, and both were evaluated on **held-out resumes featuring unseen layouts, new header synonyms, and varied section structures**.

| Training Dataset | Train Size | Precision | Recall | F1-Score | Generalization Gain |
|---|---|---|---|---|---|
| **Original Resumes Only** | 10 | 0.538 | 0.323 | **0.404** | Baseline |
| **ResumeAugment AI (Augmented)** | 160 | **0.804** | **0.692** | **0.744** | **+84.2% relative gain (+0.340 F1)** |

### Per-Entity Performance Breakdown (Augmented Model)

| Entity Label | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **PHONE** | 1.000 | 1.000 | **1.000** | 4 |
| **DEGREE** | 1.000 | 1.000 | **1.000** | 4 |
| **DATE** | 0.900 | 1.000 | **0.947** | 9 |
| **EMAIL** | 1.000 | 0.800 | **0.889** | 5 |
| **SKILL** | 0.778 | 0.737 | **0.757** | 19 |
| **COMPANY** | 1.000 | 0.600 | **0.750** | 5 |
| **LOCATION** | 1.000 | 0.400 | **0.571** | 5 |
| **COLLEGE** | 0.429 | 0.750 | **0.545** | 4 |
| **DESIGNATION** | 0.500 | 0.400 | **0.444** | 5 |

---

## Advanced Feature Matrix (Implemented & Live)

| # | Feature Name | Category | Description |
|---|---|---|---|
| **1.1** | **Prompt-to-Resume Generator** | GenAI Synthesis | Zero-shot resume synthesis from plain-text job roles or prompt specifications, creating labeled markup on the fly. |
| **1.2** | **LLM Tone & Persona Rewriter** | GenAI Rephrasing | Rewrites resumes dynamically into Executive/VP, Tech Lead, Entry-Level, or Research tones with guaranteed zero entity drift. |
| **1.3** | **Recruiter Executive Brief** | GenAI Synthesis | Synthesizes complex candidate resumes into an instant 3-bullet executive summary (Seniority, Domain, and Key Technical Impact). |
| **2.1** | **Universal Document Ingestion** | Document Processing | Native drag-and-drop parsing for real-world **PDF** (via `pypdf`), **DOCX** (via `python-docx`), and plain text (`.txt`) files. |
| **2.2** | **JD Skill Matcher & Fit Score** | HR Analytics | Parses Job Descriptions, extracts required skills, calculates % candidate fit score, identifies missing skills, and issues hiring recommendations. |
| **2.3** | **Fair Hiring & Bias Mitigation** | Compliance / DEI | Blind screening toggle that masks all PII (`NAME`, `EMAIL`, `PHONE`, `COLLEGE`, `LOCATION`) with non-reconstructable anonymized tokens. |
| **2.4** | **Cross-Locale Regional Formatting** | Localization | Adapts resume formatting seamlessly across **US** (GPA, city/state), **EU Europass** (languages, date conventions), and **India** (trunk dialing, degree standards). |
| **3.1** | **Multi-Column OCR Glitch Simulator** | Robustness / Stress | Simulates physical two-column text bleed, spacing collapse, and OCR confusion typos (`l/1`, `o/0`) to harden parser models. |
| **3.2** | **Word-by-Word Visual Diff Viewer** | Inspection / Audit | Token-level color-coded visual diff viewer highlighting insertions (green), deletions (red), and substitutions between original and augmented resumes. |
| **3.4** | **Active Learning Corrections Store** | MLOps | Human-in-the-loop retraining queue storing reviewer corrections directly to `active_learning_corrections.jsonl` for continuous model improvement. |

---

## Project Structure

```
resume-augment-ai/
├── server.py                  # High-performance FastAPI server + static React distribution
├── run_demo.py                # End-to-end one-click demonstration script
├── pyproject.toml             # Package metadata and dependencies
├── requirements.txt           # Pip dependencies
├── docs/
│   └── SPECIFICATION.md       # Formal Deliverable 1: Dataset analysis & augmentation specification
├── frontend/                  # Modern React 19 + Tailwind CSS frontend
│   ├── src/
│   │   ├── App.jsx            # 5-tab unified web studio (Editor, Studio, Analytics, Benchmark, Settings)
│   │   ├── index.css          # Clean paper styling, white background, custom typography
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── data/
│   ├── base_resumes.md        # 10 diverse annotated base resumes (10 archetypes)
│   └── heldout_resumes.md     # 5 unseen held-out resumes for generalization testing
├── scripts/
│   ├── run_augment.py         # Dataset generation CLI with universal exports & validation
│   ├── validate_dataset.py    # Dedicated dataset quality evaluation & gate CLI
│   ├── train_eval.py          # Baseline vs Augmented parser training & benchmarking
│   └── parse_resume.py        # Production inference CLI for structured entity extraction
├── output/
│   ├── augmented.jsonl        # Primary augmented dataset
│   ├── validation_summary.csv # Pandas validation summary across 4 dimensions
│   ├── validation_report.json # Detailed quality report & scores
│   ├── train.spacy            # spaCy DocBin binary dataset
│   ├── dataset.conll          # CoNLL-2003 IOB dataset
│   ├── huggingface_dataset.json # HuggingFace Transformers dataset
│   └── splits/                # Leakage-free train / val / test splits
├── src/resumeaugment/
│   ├── __init__.py            # Top-level API exports
│   ├── config.py              # Tunable probabilities & hyperparameter dataclass
│   ├── schema.py              # Resume data model & markup parser
│   ├── render.py              # Layout formatting & exact character-offset engine
│   ├── pipeline.py            # Augmentation orchestrator (NLPAug + spaCy + Pandas)
│   ├── validator.py           # Multi-dimensional validation & quality gate engine
│   ├── generators.py          # GenAI synthesis, persona rewriters, JD matcher, document parser, PII mask
│   ├── export.py              # JSONL, CoNLL, HuggingFace, spaCy DocBin exporters
│   ├── utils.py               # BIO span parsing and helpers
│   └── augmenters/
│       ├── entities.py        # Surface variation (Phone, Date, Degree, Company)
│       ├── text.py            # Action verbs, WordNet synonyms, OCR typos
│       ├── layout.py          # Headers, section order, bullets, contact layout
│       └── llm.py             # Generative AI masked bullet rephrasing
└── tests/
    ├── test_pipeline.py       # Pipeline, rendering, and validation unit tests
    └── test_generators.py     # GenAI, parser, matcher, anonymizer unit tests (21 passed)
```

---

## Installation & Setup

### Using standard `venv` & `pip`:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -e .
python -m nltk.downloader wordnet omw-1.4 averaged_perceptron_tagger
```

### Using `uv` (Fastest):
```bash
uv venv --python 3.11 .venv
uv pip install -r requirements.txt -e .
.venv/Scripts/python -m nltk.downloader wordnet omw-1.4 averaged_perceptron_tagger
```

---

## Launching on Localhost

Start the unified FastAPI + React server:

```bash
python server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

The single server hosts:
- **FastAPI REST API**: Under `/api/*`
- **React 19 Web Studio**: Directly at `/` with zero CORS hurdles or port conflicts.

---

## Running the Automated Test Suite

Run the 21 comprehensive unit tests covering parsing, entity surface variation, layout transformations, character offset integrity, document extraction, JD matching, anonymization, and multi-dimensional dataset validation:

```bash
pytest -v
```

### 1. Generate Augmented Data
```bash
python scripts/run_augment.py --input data/base_resumes.md --output-dir output --variants 15
```
Options:
- `--variants N`: Number of variants per base resume (default: 20).
- `--no-nlpaug`: Disable WordNet synonym augmentation.
- `--use-llm`: Enable Generative AI / LLM bullet phrasing mode.
- `--seed N`: Set random seed for exact reproducibility.

### 2. Validate Augmented Dataset Quality
Evaluate generated records for content consistency, structural diversity, data integrity, and entity preservation:
```bash
python scripts/validate_dataset.py --input output/augmented.jsonl --output-dir output
```
Outputs:
- Detailed dimension scores (Data Integrity: 100%, Consistency: 100%, Zero-Drift Preservation: 100%, Diversity Index: 75%+).
- Exported validation report at `output/validation_report.json`.
- Exported validation CSV summary at `output/validation_summary.csv`.

### 3. Train and Benchmark the Parser
```bash
python scripts/train_eval.py --augmented output/augmented.jsonl --test data/heldout_resumes.md --epochs 30 --save-model output/model
```
Outputs:
- Direct comparison table between `Original only` and `Augmented`.
- Generalization Delta (+F1 gain).
- Per-entity breakdown table.
- Serialized trained spaCy model to `--save-model`.

### 3. Parse Unseen Resumes
```bash
python scripts/parse_resume.py --model output/model --text "Vikram Iyer | vikram.iyer@webmail.com | +91-9988776655 | Chennai ... "
```
Or parse a resume from file:
```bash
python scripts/parse_resume.py --model output/model --file my_resume.txt --output candidate.json
```

---

## Running the Automated Test Suite

Run the 12 comprehensive unit tests covering parsing, entity surface variation, layout transformations, character offset integrity, and exports:

```bash
pytest -v
```

---

## Supported Entity Labels

- `NAME`: Candidate name
- `EMAIL`: Email address
- `PHONE`: Phone number
- `LOCATION`: City, state, country
- `DESIGNATION`: Job title / role
- `COMPANY`: Employer / organization
- `COLLEGE`: University / institution
- `DEGREE`: Educational qualification
- `SKILL`: Technical tool, framework, or competency
- `DATE`: Employment or graduation dates / ranges
- `LINK`: Portfolio, LinkedIn, or GitHub links
- `CERTIFICATION`: Professional licenses or certifications

---

## Authoring Base Resumes

Base resumes are authored in human-readable markup:

```markdown
=== r001 ===
## [contact] Contact
<NAME>Priya Sharma</NAME>
<EMAIL>priya.sharma@mail.com</EMAIL>
<PHONE>+91 98480 12345</PHONE>
<LOCATION>Hyderabad, India</LOCATION>

## [summary] Summary
Machine learning engineer with two years of experience building NLP pipelines for document understanding.

## [experience] Experience
- <DESIGNATION>Machine Learning Intern</DESIGNATION> at <COMPANY>Acme Analytics</COMPANY>, <DATE>Jun 2024 - Aug 2024</DATE>
- Built a text classification model that raised ticket routing accuracy by 18%.

## [education] Education
<DEGREE>B.Tech in Computer Science</DEGREE> from <COLLEGE>Lakeside Institute of Technology</COLLEGE>, <DATE>2021 - 2025</DATE>

## [skills] Skills
<SKILL>Python</SKILL>
<SKILL>spaCy</SKILL>
<SKILL>PyTorch</SKILL>
<SKILL>SQL</SKILL>
```

---

## Tech Stack

- **Python 3.9+ / 3.11**: Core language runtime
- **spaCy 3.8+**: Transition-based Named Entity Recognition (NER), exact tokenization, and vector models
- **NLPAug & NLTK**: Lexical variation, WordNet synonym substitution, OCR/keyboard modeling
- **Pandas**: Tabular dataset summaries and evaluation metrics aggregation
- **FastAPI & Uvicorn**: High-performance asynchronous backend API and static web server
- **React 19 & Vite**: Modern reactive frontend with real-time state and component modularity
- **Tailwind CSS v4**: Professional clean white canvas styling, crisp document paper elevation, and responsive design
- **Lucide Icons**: Comprehensive iconography across all recruitment workflows
