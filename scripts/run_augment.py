"""Generate augmented training data from base resumes.

Usage:
    python scripts/run_augment.py --input data/base_resumes.md --output-dir output --variants 20
"""
import argparse
import os
from pathlib import Path

from resumeaugment import AugmentConfig, ResumeAugmenter
from resumeaugment.schema import load_resumes
from resumeaugment.export import (
    write_jsonl, to_frame, entity_summary, op_summary,
    write_docbin, write_conll, write_huggingface, write_spacy_json, write_dataset_splits
)
from resumeaugment.validator import (
    validate_dataset, generate_validation_summary_frame, write_validation_reports
)


def resolve_path(p: str) -> Path:
    target = Path(p)
    if target.exists():
        return target
    # Fallback to repo-relative path if run from project parent
    repo_rel = Path(__file__).resolve().parent.parent / p
    if repo_rel.exists():
        return repo_rel
    return target


def main():
    p = argparse.ArgumentParser(description="ResumeAugment AI - Data Augmentation Pipeline")
    p.add_argument("--input", default="data/base_resumes.md", help="Path to base resumes markup")
    p.add_argument("--output-dir", default="output", help="Directory to save augmented outputs")
    p.add_argument("--variants", type=int, default=20, help="Number of variants per base resume")
    p.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    p.add_argument("--no-nlpaug", action="store_true", help="Disable WordNet synonym augmentation")
    p.add_argument("--use-llm", action="store_true", help="Enable Generative AI bullet rephrasing")
    args = p.parse_args()

    input_path = resolve_path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    cfg = AugmentConfig(
        variants_per_resume=args.variants,
        seed=args.seed,
        use_nlpaug=not args.no_nlpaug,
        use_llm=args.use_llm,
    )

    print(f"Loading base resumes from: {input_path}")
    resumes = load_resumes(input_path)
    print(f"Loaded {len(resumes)} base resume profiles.")

    augmenter = ResumeAugmenter(cfg)
    examples = [ex for r in resumes for ex in augmenter.generate(r)]

    # 1. Standard training outputs
    jsonl_path = output_dir / "augmented.jsonl"
    write_jsonl(examples, jsonl_path)

    # 2. Analytics summaries
    to_frame(examples).to_csv(output_dir / "augmented_summary.csv", index=False)
    ent_df = entity_summary(examples)
    ent_df.to_csv(output_dir / "entity_counts.csv", index=False)
    op_df = op_summary(examples)
    op_df.to_csv(output_dir / "operation_counts.csv", index=False)

    # 3. Framework-specific formats
    write_docbin(examples, output_dir / "train.spacy")
    write_conll(examples, output_dir / "dataset.conll")
    write_huggingface(examples, output_dir / "huggingface_dataset.json")
    write_spacy_json(examples, output_dir / "spacy_annotations.json")

    # 4. Leakage-free train/val/test splits
    split_counts = write_dataset_splits(examples, output_dir / "splits")

    # 5. Dataset Validation Suite (Quality, Integrity & Diversity Evaluation)
    validation_report = validate_dataset(examples)
    val_paths = write_validation_reports(validation_report, output_dir)
    val_df = generate_validation_summary_frame(validation_report)

    print("\n" + "=" * 60)
    print(f"ResumeAugment AI - Augmentation & Validation Completed")
    print("=" * 60)
    print(f"Base resumes: {len(resumes)}  |  Total examples generated: {len(examples)}")
    print(f"Data Splits:  Train: {split_counts['train']} | Val: {split_counts['val']} | Test: {split_counts['test']}")
    print(f"Quality Score: {validation_report['overall_quality_score']}%  |  Status: [{validation_report['status']}]")
    print(f"\nOutputs written to '{output_dir}/':")
    print(f"  • JSONL Dataset:        {jsonl_path}")
    print(f"  • spaCy DocBin:         {output_dir / 'train.spacy'}")
    print(f"  • CoNLL-2003:           {output_dir / 'dataset.conll'}")
    print(f"  • HuggingFace Dataset:  {output_dir / 'huggingface_dataset.json'}")
    print(f"  • Char-Offset JSON:     {output_dir / 'spacy_annotations.json'}")
    print(f"  • Pandas CSV summaries: {output_dir / 'augmented_summary.csv'}")
    print(f"  • Validation JSON:      {val_paths['json']}")
    print(f"  • Validation CSV:       {val_paths['csv']}")

    print("\n--- Dataset Validation & Quality Summary ---")
    print(val_df.to_string(index=False))

    print("\n--- Entity Distribution ---")
    print(ent_df.to_string(index=False))

    print("\n--- Augmentation Operations Applied ---")
    print(op_df.to_string(index=False))
    print("=" * 60)


if __name__ == "__main__":
    main()
