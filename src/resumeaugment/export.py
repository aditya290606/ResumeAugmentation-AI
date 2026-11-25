"""Export helpers: JSONL for training, pandas summaries, spaCy DocBin, CoNLL, and Hugging Face."""
import json
import random
from collections import Counter
from dataclasses import asdict
from pathlib import Path
from typing import Dict, List

import pandas as pd

from .utils import bio_to_spans


def write_jsonl(examples, path):
    """Write examples to JSONL with tokens, IOB tags, spans, and metadata."""
    with open(path, "w", encoding="utf-8") as f:
        for ex in examples:
            f.write(json.dumps(asdict(ex), ensure_ascii=False) + "\n")


def to_frame(examples) -> pd.DataFrame:
    rows = []
    for ex in examples:
        rows.append({
            "example_id": ex.example_id,
            "source_id": ex.source_id,
            "num_tokens": len(ex.tokens),
            "num_entities": len(bio_to_spans(ex.ents)),
            "augmentations": ",".join(ex.augmentations),
            "text": ex.text,
        })
    return pd.DataFrame(rows)


def entity_summary(examples) -> pd.DataFrame:
    counts = Counter()
    for ex in examples:
        for _, _, label in bio_to_spans(ex.ents):
            counts[label] += 1
    return pd.DataFrame(sorted(counts.items(), key=lambda kv: -kv[1]), columns=["label", "count"])


def op_summary(examples) -> pd.DataFrame:
    counts = Counter(op for ex in examples for op in ex.augmentations)
    return pd.DataFrame(sorted(counts.items(), key=lambda kv: -kv[1]), columns=["operation", "count"])


def write_docbin(examples, path):
    """Write a spaCy DocBin usable by `spacy train` or custom NER training."""
    import spacy
    from spacy.tokens import Doc, DocBin

    nlp = spacy.blank("en")
    db = DocBin()
    for ex in examples:
        db.add(Doc(nlp.vocab, words=ex.tokens, ents=ex.ents))
    db.to_disk(path)


def write_conll(examples, path):
    """Export examples to standard CoNLL-2003 format (Token <space> IOB-Tag)."""
    with open(path, "w", encoding="utf-8") as f:
        for ex in examples:
            f.write(f"-DOCSTART- -X- -X- {ex.example_id}\n\n")
            for tok, tag in zip(ex.tokens, ex.ents):
                f.write(f"{tok} {tag}\n")
            f.write("\n")


def write_huggingface(examples, path, map_path=None):
    """Export to HuggingFace datasets format (integer ner_tags) with label mapping JSON."""
    all_tags = sorted(list({tag for ex in examples for tag in ex.ents}))
    tag_to_id: Dict[str, int] = {tag: i for i, tag in enumerate(all_tags)}

    records = []
    for ex in examples:
        records.append({
            "id": ex.example_id,
            "source_id": ex.source_id,
            "tokens": ex.tokens,
            "ner_tags": [tag_to_id[t] for t in ex.ents],
            "text": ex.text,
        })

    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    if map_path is None:
        map_path = str(Path(path).with_name("ner_tags_map.json"))

    with open(map_path, "w", encoding="utf-8") as f:
        json.dump({
            "tag_to_id": tag_to_id,
            "id_to_tag": {v: k for k, v in tag_to_id.items()},
        }, f, indent=2)


def write_spacy_json(examples, path):
    """Export in char-offset JSON format for spaCy v3, Label Studio, or Prodigy."""
    records = []
    for ex in examples:
        records.append({
            "id": ex.example_id,
            "text": ex.text,
            "entities": [
                [s["start"], s["end"], s["label"]] for s in ex.spans
            ],
        })
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)


def write_dataset_splits(examples, output_dir, train_ratio=0.8, val_ratio=0.1, test_ratio=0.1, seed=42):
    """Split dataset by source_id into train/val/test to prevent data leakage."""
    rng = random.Random(seed)
    source_ids = sorted(list({ex.source_id for ex in examples}))
    rng.shuffle(source_ids)

    n_total = len(source_ids)
    n_train = max(1, int(n_total * train_ratio))
    n_val = max(1, int(n_total * val_ratio)) if n_total > 2 else 0

    train_sources = set(source_ids[:n_train])
    val_sources = set(source_ids[n_train:n_train + n_val])
    test_sources = set(source_ids[n_train + n_val:]) if (n_train + n_val) < n_total else val_sources

    train_ex = [e for e in examples if e.source_id in train_sources]
    val_ex = [e for e in examples if e.source_id in val_sources]
    test_ex = [e for e in examples if e.source_id in test_sources]

    out_p = Path(output_dir)
    out_p.mkdir(parents=True, exist_ok=True)

    write_jsonl(train_ex, out_p / "train.jsonl")
    if val_ex:
        write_jsonl(val_ex, out_p / "val.jsonl")
    if test_ex:
        write_jsonl(test_ex, out_p / "test.jsonl")

    return {
        "train": len(train_ex),
        "val": len(val_ex),
        "test": len(test_ex),
    }
