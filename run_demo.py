"""End-to-End One-Click Demo Runner for ResumeAugment AI.

Runs:
  1. Test suite validation
  2. Data augmentation pipeline across base resumes
  3. Parser training and generalization benchmark
  4. Real-time structured resume parsing demonstration
  5. UI launch instructions
"""
import subprocess
import sys
from pathlib import Path


def run_step(title: str, cmd: list, cwd: Path):
    print("\n" + "=" * 65)
    print(f"STEP: {title}")
    print("=" * 65)
    result = subprocess.run(cmd, cwd=str(cwd))
    if result.returncode != 0:
        print(f"\n[Error] Step '{title}' failed with exit code {result.returncode}", file=sys.stderr)
        sys.exit(result.returncode)


def main():
    root = Path(__file__).resolve().parent
    py_exec = sys.executable

    print("\n" + "#" * 65)
    print("#  ResumeAugment AI: Resume Parsing Data Augmenter")
    print("#  Domain: HR & Recruiting | End-to-End Demonstration")
    print("#" * 65)

    # 1. Run Tests
    run_step(
        "Run Test Suite (PyTest)",
        [py_exec, "-m", "pytest", "-v", "tests"],
        cwd=root,
    )

    # 2. Run Augmentation
    run_step(
        "Generate Augmented Resume Dataset (10 variants/resume)",
        [py_exec, "scripts/run_augment.py", "--variants", "10", "--output-dir", "output"],
        cwd=root,
    )

    # 3. Validate Augmented Dataset
    run_step(
        "Validate Augmented Dataset (Consistency, Diversity & Integrity Check)",
        [py_exec, "scripts/validate_dataset.py", "--input", "output/augmented.jsonl", "--output-dir", "output"],
        cwd=root,
    )

    # 4. Benchmark Training
    run_step(
        "Benchmark Parser Robustness (Baseline vs Augmented)",
        [py_exec, "scripts/train_eval.py", "--epochs", "25", "--save-model", "output/model"],
        cwd=root,
    )

    # 5. Live Parser Inference
    run_step(
        "Live Parser Inference on Unseen Resume",
        [py_exec, "scripts/parse_resume.py", "--model", "output/model"],
        cwd=root,
    )

    print("\n" + "=" * 65)
    print("ALL DEMO STEPS COMPLETED SUCCESSFULLY!")
    print("=" * 65)
    print("\nTo launch the React + Tailwind Web Application:")
    print("    python server.py")
    print("    Open in browser: http://localhost:8000")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()

