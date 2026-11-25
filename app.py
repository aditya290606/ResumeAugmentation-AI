"""ResumeAugment AI - Interactive Streamlit Studio.

Run with:
    streamlit run app.py
"""
import copy
import json
import random
from pathlib import Path
from typing import List

import pandas as pd
import streamlit as st

from resumeaugment import (
    AugmentConfig, ResumeAugmenter, render, LayoutSettings,
    load_resumes, parse_markup, ENTITY_LABELS
)
from resumeaugment.export import (
    to_frame, entity_summary, op_summary,
    write_conll, write_huggingface, write_spacy_json
)
from resumeaugment.utils import bio_to_spans

st.set_page_config(
    page_title="ResumeAugment AI Studio",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #1E3A8A, #3B82F6, #10B981);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #4B5563;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .badge {
        display: inline-block;
        padding: 3px 8px;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 4px;
        margin-right: 5px;
    }
    .badge-name { background-color: #DBEAFE; color: #1E40AF; }
    .badge-skill { background-color: #D1FAE5; color: #065F46; }
    .badge-company { background-color: #EDE9FE; color: #5B21B6; }
    .badge-desig { background-color: #FEF3C7; color: #92400E; }
    .badge-phone { background-color: #FEE2E2; color: #991B1B; }
    .badge-email { background-color: #E0E7FF; color: #3730A3; }
    .badge-date { background-color: #F3F4F6; color: #374151; }
    .resume-box {
        background-color: #F9FAFB;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 16px;
        font-family: 'Consolas', monospace;
        font-size: 0.9rem;
        white-space: pre-wrap;
        line-height: 1.5;
        min-height: 380px;
    }
</style>
""", unsafe_allow_html=True)


def get_base_resumes_file() -> Path:
    direct = Path("data/base_resumes.md")
    if direct.exists():
        return direct
    return Path(__file__).resolve().parent / "data" / "base_resumes.md"


def render_html_with_entities(tokens: List[str], ents: List[str]) -> str:
    color_map = {
        "NAME": "#3B82F6",
        "EMAIL": "#6366F1",
        "PHONE": "#EF4444",
        "LOCATION": "#EC4899",
        "DESIGNATION": "#F59E0B",
        "COMPANY": "#8B5CF6",
        "COLLEGE": "#14B8A6",
        "DEGREE": "#10B981",
        "SKILL": "#059669",
        "DATE": "#6B7280",
    }
    html_chunks = []
    i = 0
    while i < len(tokens):
        tag = ents[i]
        if tag == "O":
            html_chunks.append(tokens[i])
            i += 1
        else:
            prefix, label = tag.split("-", 1)
            span_tokens = [tokens[i]]
            i += 1
            while i < len(tokens) and ents[i].startswith("I-") and ents[i].split("-", 1)[1] == label:
                span_tokens.append(tokens[i])
                i += 1
            color = color_map.get(label, "#4B5563")
            span_text = " ".join(span_tokens)
            html_chunks.append(
                f'<span style="background-color: {color}22; border-bottom: 2px solid {color}; '
                f'padding: 1px 4px; border-radius: 3px; font-weight: 500;">'
                f'{span_text} <sub style="color: {color}; font-size: 0.65rem; font-weight: bold;">{label}</sub></span>'
            )
    return " ".join(html_chunks)


# Header
st.markdown('<div class="main-title">ResumeAugment AI: Resume Parsing Data Augmenter</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Domain: HR & Recruiting | Augmenting resume text and layout data for parsing-model robustness</div>', unsafe_allow_html=True)

# Sidebar Configuration
st.sidebar.header("Augmentation Settings")

variants_count = st.sidebar.slider("Variants per Resume", min_value=1, max_value=50, value=10)
seed = st.sidebar.number_input("Random Seed", value=42)

st.sidebar.subheader("Layout Variations")
header_rename_p = st.sidebar.slider("Header Rename Prob", 0.0, 1.0, 0.6)
reorder_sections_p = st.sidebar.slider("Section Reorder Prob", 0.0, 1.0, 0.4)
contact_multiline_p = st.sidebar.slider("Multi-line Contact Prob", 0.0, 1.0, 0.35)
merge_skills_p = st.sidebar.slider("Inline Skills Prob", 0.0, 1.0, 0.3)
header_style_p = st.sidebar.slider("Decorated Headers Prob", 0.0, 1.0, 0.3)

st.sidebar.subheader("Text & Wording Variations")
use_nlpaug = st.sidebar.checkbox("Enable WordNet Synonyms (nlpaug)", value=True)
use_llm = st.sidebar.checkbox("Enable Generative AI Bullet Phrasing", value=False)
verb_swap_p = st.sidebar.slider("Action Verb Swap Prob", 0.0, 1.0, 0.4)
typo_word_p = st.sidebar.slider("Typo / OCR Error Rate", 0.0, 0.1, 0.03, step=0.01)

st.sidebar.subheader("Entity Surface Variations")
phone_p = st.sidebar.slider("Phone Format Prob", 0.0, 1.0, 0.8)
date_p = st.sidebar.slider("Date Format Prob", 0.0, 1.0, 0.8)
company_suffix_p = st.sidebar.slider("Company Suffix Variation", 0.0, 1.0, 0.4)
degree_p = st.sidebar.slider("Degree Expansion Prob", 0.0, 1.0, 0.4)

cfg = AugmentConfig(
    variants_per_resume=variants_count,
    seed=seed,
    use_nlpaug=use_nlpaug,
    use_llm=use_llm,
    header_rename_p=header_rename_p,
    reorder_sections_p=reorder_sections_p,
    contact_multiline_p=contact_multiline_p,
    merge_skills_p=merge_skills_p,
    header_style_p=header_style_p,
    verb_swap_p=verb_swap_p,
    typo_word_p=typo_word_p,
    phone_p=phone_p,
    date_p=date_p,
    company_suffix_p=company_suffix_p,
    degree_p=degree_p,
)

# Main Navigation Tabs
tab_studio, tab_analytics, tab_exports, tab_parser = st.tabs([
    "🎨 Augmenter Studio",
    "📊 Dataset Analytics",
    "💾 Export Formats",
    "🤖 Model Benchmark & Parser",
])

# Load Base Resumes
base_path = get_base_resumes_file()
try:
    all_resumes = load_resumes(base_path)
except Exception as e:
    st.error(f"Failed to load base resumes: {e}")
    all_resumes = []

resume_options = {r.resume_id: r for r in all_resumes}

# -------------------------------------------------------------
# TAB 1: STUDIO
# -------------------------------------------------------------
with tab_studio:
    st.subheader("Interactive Resume Variation Studio")

    col_select, col_mode = st.columns([2, 1])
    with col_select:
        selected_id = st.selectbox("Select Base Resume Profile:", options=list(resume_options.keys()))
    with col_mode:
        view_mode = st.radio("Display View:", ["Formatted Text with Entity Badges", "Plain Raw Text"], horizontal=True)

    if selected_id:
        target_resume = resume_options[selected_id]

        if st.button("🚀 Generate Variations Now", type="primary"):
            with st.spinner("Augmenting layout, vocabulary, and entities..."):
                augmenter = ResumeAugmenter(cfg)
                examples = augmenter.generate(target_resume)
                st.session_state["current_examples"] = examples
                st.session_state["target_resume"] = target_resume

        if "current_examples" in st.session_state:
            examples = st.session_state["current_examples"]
            st.success(f"Generated {len(examples)} unique variants (including original baseline).")

            orig_ex = examples[0]
            variant_choices = [f"Variant #{i}: {ex.example_id} ({len(ex.augmentations)} ops)" for i, ex in enumerate(examples)]
            sel_var_idx = st.selectbox("Select Variant to Compare:", range(len(examples)), format_func=lambda i: variant_choices[i])

            active_variant = examples[sel_var_idx]

            col1, col2 = st.columns(2)
            with col1:
                st.markdown("### 📋 Original Base Resume")
                st.caption(f"Tokens: {len(orig_ex.tokens)} | Entities: {len(bio_to_spans(orig_ex.ents))}")
                if view_mode == "Formatted Text with Entity Badges":
                    st.markdown(f'<div class="resume-box">{render_html_with_entities(orig_ex.tokens, orig_ex.ents)}</div>', unsafe_allow_html=True)
                else:
                    st.text_area("Original Text", orig_ex.text, height=400, disabled=True)

            with col2:
                st.markdown(f"### ✨ Augmented: `{active_variant.example_id}`")
                st.caption(f"Tokens: {len(active_variant.tokens)} | Entities: {len(bio_to_spans(active_variant.ents))}")
                if view_mode == "Formatted Text with Entity Badges":
                    st.markdown(f'<div class="resume-box">{render_html_with_entities(active_variant.tokens, active_variant.ents)}</div>', unsafe_allow_html=True)
                else:
                    st.text_area("Augmented Text", active_variant.text, height=400, disabled=True)

            st.markdown("#### Applied Augmentation Operations:")
            if active_variant.augmentations:
                ops_html = " ".join([f'<span class="badge badge-skill">{op}</span>' for op in active_variant.augmentations])
                st.markdown(ops_html, unsafe_allow_html=True)
            else:
                st.info("Original un-augmented baseline rendering.")

# -------------------------------------------------------------
# TAB 2: ANALYTICS
# -------------------------------------------------------------
with tab_analytics:
    st.subheader("Data Augmentation Quality & Distribution Analytics")

    if st.button("Generate Full Augmentation Dataset for Analytics"):
        with st.spinner("Augmenting all base resumes..."):
            augmenter = ResumeAugmenter(cfg)
            full_dataset = [ex for r in all_resumes for ex in augmenter.generate(r)]
            st.session_state["full_dataset"] = full_dataset

    if "full_dataset" in st.session_state:
        dataset = st.session_state["full_dataset"]
        df_summary = to_frame(dataset)
        df_entities = entity_summary(dataset)
        df_ops = op_summary(dataset)

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Total Resumes Generated", len(dataset))
        m2.metric("Total Entity Instances", df_entities["count"].sum())
        m3.metric("Avg Tokens / Resume", f"{df_summary['num_tokens'].mean():.1f}")
        m4.metric("Unique Operation Types", len(df_ops))

        col_a, col_b = st.columns(2)
        with col_a:
            st.markdown("#### Entity Class Distribution")
            st.bar_chart(df_entities.set_index("label"))
        with col_b:
            st.markdown("#### Augmentation Operations Frequency")
            st.bar_chart(df_ops.set_index("operation"))

        st.markdown("#### Sample Dataset Records")
        st.dataframe(df_summary[["example_id", "source_id", "num_tokens", "num_entities", "augmentations"]].head(15), use_container_width=True)

# -------------------------------------------------------------
# TAB 3: EXPORTS
# -------------------------------------------------------------
with tab_exports:
    st.subheader("Universal ML & NLP Format Exporter")
    st.markdown("Export your augmented training data into formats compatible with **spaCy**, **Hugging Face**, **Stanford NER**, **Label Studio**, and **Pandas**.")

    if "full_dataset" not in st.session_state:
        st.info("Generate the full dataset in the Analytics tab first to export.")
    else:
        dataset = st.session_state["full_dataset"]
        tmp_dir = Path("output")
        tmp_dir.mkdir(parents=True, exist_ok=True)

        jsonl_content = "\n".join([json.dumps(ex.__dict__, default=str) for ex in dataset])
        csv_content = to_frame(dataset).to_csv(index=False)

        col_d1, col_d2, col_d3 = st.columns(3)
        with col_d1:
            st.download_button(
                "⬇️ Download JSONL Dataset",
                data=jsonl_content,
                file_name="augmented_resumes.jsonl",
                mime="application/json",
            )
        with col_d2:
            st.download_button(
                "⬇️ Download Summary CSV",
                data=csv_content,
                file_name="augmented_summary.csv",
                mime="text/csv",
            )
        with col_d3:
            # CoNLL format preview
            conll_path = tmp_dir / "preview.conll"
            write_conll(dataset[:10], conll_path)
            st.download_button(
                "⬇️ Download CoNLL-2003 (Sample)",
                data=conll_path.read_text(encoding="utf-8"),
                file_name="dataset.conll",
                mime="text/plain",
            )

        st.markdown("#### Format Previews")
        p1, p2 = st.tabs(["CoNLL-2003 Preview", "Char-Offset JSON Preview"])
        with p1:
            st.code("\n".join(conll_path.read_text(encoding="utf-8").splitlines()[:25]), language="text")
        with p2:
            sample_spacy_json = [
                {"id": ex.example_id, "text": ex.text[:120] + "...", "entities": [[s["start"], s["end"], s["label"]] for s in ex.spans[:3]]}
                for ex in dataset[:2]
            ]
            st.json(sample_spacy_json)

# -------------------------------------------------------------
# TAB 4: BENCHMARK & PARSER
# -------------------------------------------------------------
with tab_parser:
    st.subheader("Model Generalization Benchmark & Live Resume Parser")
    st.markdown("""
    Evaluate how training on **augmented layouts** compares to training on **originals only** when faced with unseen, real-world resume formats.
    """)

    sample_input = st.text_area(
        "Paste Resume Text to Parse:",
        value="""Priya Sharma
priya.sharma@mail.com | +91 98480 12345 | Hyderabad, India
WORK HISTORY
Senior ML Engineer at Acme Analytics, Jun 2024 - Aug 2024
• Built a text classification model that raised ticket routing accuracy by 18%.
TECH STACK
Python, spaCy, PyTorch, SQL
EDUCATION
B.Tech in Computer Science from Lakeside Institute of Technology, 2021 - 2025""",
        height=200,
    )

    if st.button("🔍 Parse Resume with Trained Parser", type="primary"):
        model_dir = Path("output/model")
        if not model_dir.exists():
            st.warning("Model not found in 'output/model'. Run scripts/train_eval.py --save-model output/model to train and save the parser.")
        else:
            import spacy
            from scripts.parse_resume import extract_entities
            nlp = spacy.load(model_dir)
            extracted = extract_entities(nlp, sample_input)

            st.markdown("### Extracted Entities")
            for lab, vals in extracted.items():
                st.markdown(f"**{lab}:** " + ", ".join([f"`{v}`" for v in vals]))

            with st.expander("View Full JSON Output"):
                st.json(extracted)

