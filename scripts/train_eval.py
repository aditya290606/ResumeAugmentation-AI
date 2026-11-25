"""Measure whether augmentation improves parser generalization to unseen layouts.

Trains a spaCy NER model on (a) original resumes only and (b) augmented data,
then scores both on held-out resumes in different formats.

Usage:
    python scripts/run_augment.py
    python scripts/train_eval.py --augmented output/augmented.jsonl --test data/heldout_resumes.md --save-model output/model
"""
import argparse
import json
import random
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
import spacy
from spacy.tokens import Doc
from spacy.training import Example as SpacyExample
from spacy.util import minibatch

from resumeaugment.render import render
from resumeaugment.schema import ENTITY_LABELS, load_resumes
from resumeaugment.utils import bio_to_spans


def resolve_path(p: str) -> Path:
    target = Path(p)
    if target.exists():
        return target
    repo_rel = Path(__file__).resolve().parent.parent / p
    if repo_rel.exists():
        return repo_rel
    return target


def read_jsonl(path: Path) -> List[dict]:
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def train(rows: List[dict], epochs: int, seed: int):
    random.seed(seed)
    spacy.util.fix_random_seed(seed)
    nlp = spacy.blank("en")
    ner = nlp.add_pipe("ner")
    for label in ENTITY_LABELS:
        ner.add_label(label)

    data = [
        SpacyExample(
            Doc(nlp.vocab, words=r["tokens"]),
            Doc(nlp.vocab, words=r["tokens"], ents=r["ents"])
        )
        for r in rows
    ]
    optimizer = nlp.initialize(lambda: data)
    for _ in range(epochs):
        random.shuffle(data)
        for batch in minibatch(data, size=8):
            nlp.update(batch, sgd=optimizer, drop=0.2)
    return nlp


def predict(nlp, tokens: List[str]):
    doc = Doc(nlp.vocab, words=tokens)
    for _, proc in nlp.pipeline:
        doc = proc(doc)
    return doc


def evaluate_metrics(gold_set, pred_set) -> Tuple[float, float, float]:
    tp = len(gold_set & pred_set)
    fp = len(pred_set - gold_set)
    fn = len(gold_set - pred_set)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1


def evaluate_detailed(nlp, test_rows: List[dict]):
    label_stats = {label: {"tp": 0, "fp": 0, "fn": 0} for label in ENTITY_LABELS}
    all_gold = set()
    all_pred = set()

    for idx, row in enumerate(test_rows):
        gold = {(idx, s, e, lab) for s, e, lab in bio_to_spans(row["ents"])}
        doc = predict(nlp, row["tokens"])
        pred = {(idx, e.start, e.end, e.label_) for e in doc.ents}

        all_gold |= gold
        all_pred |= pred

        for _, s, e, lab in (gold & pred):
            if lab in label_stats:
                label_stats[lab]["tp"] += 1
        for _, s, e, lab in (pred - gold):
            if lab in label_stats:
                label_stats[lab]["fp"] += 1
        for _, s, e, lab in (gold - pred):
            if lab in label_stats:
                label_stats[lab]["fn"] += 1

    overall_p, overall_r, overall_f1 = evaluate_metrics(all_gold, all_pred)

    breakdown = []
    for label, stats in label_stats.items():
        tp, fp, fn = stats["tp"], stats["fp"], stats["fn"]
        support = tp + fn
        if support == 0 and fp == 0:
            continue
        p = tp / (tp + fp) if tp + fp else 0.0
        r = tp / (tp + fn) if tp + fn else 0.0
        f = 2 * p * r / (p + r) if p + r else 0.0
        breakdown.append({
            "entity": label,
            "precision": round(p, 3),
            "recall": round(r, 3),
            "f1": round(f, 3),
            "support": support,
        })

    return {
        "precision": overall_p,
        "recall": overall_r,
        "f1": overall_f1,
        "breakdown": pd.DataFrame(breakdown),
    }


def main():
    p = argparse.ArgumentParser(description="ResumeAugment AI - Benchmark Evaluator")
    p.add_argument("--augmented", default="output/augmented.jsonl", help="Path to augmented.jsonl")
    p.add_argument("--test", default="data/heldout_resumes.md", help="Path to heldout resumes markup")
    p.add_argument("--epochs", type=int, default=30, help="Training epochs")
    p.add_argument("--seed", type=int, default=0, help="Random seed")
    p.add_argument("--save-model", default=None, help="Optional directory to save best augmented model")
    args = p.parse_args()

    aug_path = resolve_path(args.augmented)
    test_path = resolve_path(args.test)

    if not aug_path.exists():
        raise FileNotFoundError(f"Augmented dataset not found at '{aug_path}'. Run run_augment.py first.")
    if not test_path.exists():
        raise FileNotFoundError(f"Heldout test file not found at '{test_path}'.")

    rows = read_jsonl(aug_path)
    baseline = [r for r in rows if r.get("augmentations") == ["original"]]

    heldout_resumes = load_resumes(test_path)
    test_rows = [{"tokens": r.tokens, "ents": r.ents} for r in (render(x) for x in heldout_resumes)]

    print("=" * 65)
    print("ResumeAugment AI: Resume Parsing Model Robustness Benchmark")
    print("=" * 65)
    print(f"Training Baseline (Originals): {len(baseline)} resumes")
    print(f"Training Augmented:            {len(rows)} resumes")
    print(f"Held-out Unseen Test Formats:  {len(test_rows)} resumes")
    print(f"Training Epochs:               {args.epochs}")
    print("-" * 65)

    comparison_results = []
    models = {}

    for name, train_rows in [("Original only (No Augmentation)", baseline), ("Augmented (ResumeAugment AI)", rows)]:
        print(f"Training model on: {name} ...")
        nlp = train(train_rows, args.epochs, args.seed)
        models[name] = nlp
        eval_res = evaluate_detailed(nlp, test_rows)
        comparison_results.append({
            "Model Variant": name,
            "Train Examples": len(train_rows),
            "Precision": round(eval_res["precision"], 3),
            "Recall": round(eval_res["recall"], 3),
            "F1-Score": round(eval_res["f1"], 3),
            "breakdown": eval_res["breakdown"],
        })

    df_summary = pd.DataFrame([
        {k: v for k, v in res.items() if k != "breakdown"}
        for res in comparison_results
    ])

    print("\n" + "=" * 65)
    print("BENCHMARK RESULTS (Generalization on Unseen Real-World Layouts)")
    print("=" * 65)
    print(df_summary.to_string(index=False))

    base_f1 = comparison_results[0]["F1-Score"]
    aug_f1 = comparison_results[1]["F1-Score"]
    delta_f1 = aug_f1 - base_f1
    delta_pct = (delta_f1 / base_f1 * 100) if base_f1 > 0 else 100.0

    print("-" * 65)
    print(f"Generalization Delta: {delta_f1:+.3f} F1 ({delta_pct:+.1f}% improvement)")
    print("=" * 65)

    print("\n--- Detailed Per-Entity Performance (Augmented Model) ---")
    aug_breakdown = comparison_results[1]["breakdown"]
    if not aug_breakdown.empty:
        print(aug_breakdown.to_string(index=False))

    if args.save_model:
        save_dir = Path(args.save_model)
        save_dir.mkdir(parents=True, exist_ok=True)
        models["Augmented (ResumeAugment AI)"].to_disk(save_dir)
        print(f"\n[Saved] Augmented NER Model saved successfully to: '{save_dir}'")


if __name__ == "__main__":
    main()
