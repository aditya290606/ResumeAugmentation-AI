#!/usr/bin/env bash
# End-to-end: install, generate augmented data, run tests, compare training sets.
set -e
pip install -r requirements.txt
pip install -e .
python -m nltk.downloader wordnet omw-1.4
pytest -q
python scripts/run_augment.py --variants 20
python scripts/train_eval.py --augmented output/augmented.jsonl --test data/heldout_resumes.md
