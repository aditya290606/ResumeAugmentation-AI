from typing import Iterable, Set, Tuple


def bio_to_spans(tags: Iterable[str]) -> Set[Tuple[int, int, str]]:
    """Convert IOB tags to a set of (start, end_exclusive, label) spans."""
    spans: Set[Tuple[int, int, str]] = set()
    start = None
    label = None
    for i, tag in enumerate(tags):
        if tag == "O":
            if label is not None:
                spans.add((start, i, label))
                label = None
            continue
        prefix, lab = tag.split("-", 1)
        if prefix == "B" or lab != label:
            if label is not None:
                spans.add((start, i, label))
            start, label = i, lab
    if label is not None:
        spans.add((start, len(tags), label))
    return spans
