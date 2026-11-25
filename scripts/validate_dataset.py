"""Validate an augmented resume dataset for content consistency, structural diversity, data integrity, and entity preservation.

Usage:
    python scripts/validate_dataset.py --input output/augmented.jsonl --output-dir output
"""
import argparse
import json
from pathlib import Path
from types import SimpleNamespace

from resumeaugment.validator import (
    validate_dataset,
    generate_validation_summary_frame,
    write_validation_reports,
)


def load_jsonl_examples(path: Path):
    examples = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data = json.loads(line)
                examples.append(SimpleNamespace(**data))
    return examples


def main():
    p = argparse.ArgumentParser(description="ResumeAugment AI - Dataset Validation & Quality Gate")
    p.add_argument("--input", default="output/augmented.jsonl", help="Path to input augmented JSONL file")
    p.add_argument("--output-dir", default="output", help="Directory to save validation summaries")
    args = p.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        repo_rel = Path(__file__).resolve().parent.parent / args.input
        if repo_rel.exists():
            input_path = repo_rel

    if not input_path.exists():
        print(f"[Error] Dataset file not found at: {input_path}")
        print("Please run scripts/run_augment.py first to generate augmented data.")
        return 1

    print(f"Loading augmented dataset from: {input_path}")
    examples = load_jsonl_examples(input_path)
    print(f"Loaded {len(examples)} examples for quality evaluation.")

    print("\nExecuting multi-dimensional validation suite:")
    print("  1. Content Consistency (semantic preservation & non-empty spans)")
    print("  2. Structural Diversity (Shannon entropy & layout permutations)")
    print("  3. Data Integrity (BIO transition validity & char-offset alignment)")
    print("  4. Parsing Information Preservation (exact span retention)")

    report = validate_dataset(examples)
    output_dir = Path(args.output_dir)
    paths = write_validation_reports(report, output_dir)
    df = generate_validation_summary_frame(report)

    print("\n" + "=" * 65)
    print("RESUMEAUGMENT AI - DATASET VALIDATION REPORT")
    print("=" * 65)
    print(df.to_string(index=False))
    print("=" * 65)
    print(f"\nOverall Quality Status: [{report['status']}] (Score: {report['overall_quality_score']}%)")
    print(f"Reports written to:")
    print(f"  • JSON Report: {paths['json']}")
    print(f"  • CSV Summary: {paths['csv']}")
    print("=" * 65 + "\n")
    return 0


if __name__ == "__main__":
    exit(main())
