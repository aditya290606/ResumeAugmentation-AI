"""Resume Parser CLI: extracts structured candidate data from raw resume text using a trained model.

Usage:
    python scripts/parse_resume.py --model output/model --text "John Doe | john@domain.com | (555) 123-4567 ..."
    python scripts/parse_resume.py --model output/model --file sample_resume.txt
"""
import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List

import spacy
from spacy.tokens import Doc


def extract_entities(nlp, text: str) -> Dict[str, List[str]]:
    """Runs NER inference and groups extracted entities by label."""
    # Tokenize by whitespace to match training tokenization
    tokens = text.split()
    doc = Doc(nlp.vocab, words=tokens)
    for _, proc in nlp.pipeline:
        doc = proc(doc)

    extracted = defaultdict(list)
    for ent in doc.ents:
        val = ent.text.strip(" ,;•|/·")
        if val and val not in extracted[ent.label_]:
            extracted[ent.label_].append(val)

    return dict(extracted)


def main():
    p = argparse.ArgumentParser(description="Resume Parser: Extract structured data from resumes")
    p.add_argument("--model", default="output/model", help="Path to trained spaCy NER model directory")
    p.add_argument("--text", default=None, help="Direct resume text to parse")
    p.add_argument("--file", default=None, help="Path to text or markdown resume file to parse")
    p.add_argument("--output", default=None, help="Optional output JSON path")
    args = p.parse_args()

    model_path = Path(args.model)
    if not model_path.exists():
        # Fallback to repo-relative path
        repo_rel = Path(__file__).resolve().parent.parent / args.model
        if repo_rel.exists():
            model_path = repo_rel
        else:
            print(f"Error: Model not found at '{model_path}'. Please run train_eval.py --save-model output/model first.", file=sys.stderr)
            sys.exit(1)

    if args.file:
        raw_text = Path(args.file).read_text(encoding="utf-8")
    elif args.text:
        raw_text = args.text
    else:
        # Default sample resume
        raw_text = """
        Vikram Iyer
        vikram.iyer@webmail.com | +91-9988776655 | Chennai, India
        WORK HISTORY
        NLP Engineer at Silverline Tech, 2024 to 2026
        • Shipped a resume ranking model in production serving 2 million monthly users.
        TECH STACK
        Airflow, dbt, Hugging Face, Pydantic, Python, spaCy
        ACADEMICS
        B.Tech Electronics, Coastal Tech Institute, 2020-2024
        """

    print(f"Loading trained parser model from '{model_path}' ...")
    nlp = spacy.load(model_path)
    entities = extract_entities(nlp, raw_text)

    # Format structured profile
    profile = {
        "candidate": {
            "name": entities.get("NAME", ["Unknown"])[0] if entities.get("NAME") else None,
            "email": entities.get("EMAIL", [None])[0] if entities.get("EMAIL") else None,
            "phone": entities.get("PHONE", [None])[0] if entities.get("PHONE") else None,
            "location": entities.get("LOCATION", [None])[0] if entities.get("LOCATION") else None,
        },
        "experience": [
            {
                "designation": des,
                "company": entities.get("COMPANY", [None])[i] if i < len(entities.get("COMPANY", [])) else None,
                "dates": entities.get("DATE", [None])[i] if i < len(entities.get("DATE", [])) else None,
            }
            for i, des in enumerate(entities.get("DESIGNATION", []))
        ],
        "education": [
            {
                "degree": deg,
                "college": entities.get("COLLEGE", [None])[i] if i < len(entities.get("COLLEGE", [])) else None,
            }
            for i, deg in enumerate(entities.get("DEGREE", []))
        ],
        "skills": entities.get("SKILL", []),
        "all_extracted_entities": entities,
    }

    formatted_json = json.dumps(profile, indent=2, ensure_ascii=False)
    print("\n" + "=" * 50)
    print("STRUCTURED RESUME EXTRACTION OUTPUT")
    print("=" * 50)
    print(formatted_json)
    print("=" * 50)

    if args.output:
        Path(args.output).write_text(formatted_json, encoding="utf-8")
        print(f"Saved extracted JSON to: {args.output}")


if __name__ == "__main__":
    main()

