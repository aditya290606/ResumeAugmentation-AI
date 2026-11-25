"""Orchestrates entity -> text -> LLM -> layout augmentation and renders token-level examples."""
import copy
import random
from dataclasses import dataclass, field
from typing import List, Optional

from .config import AugmentConfig
from .render import Rendered, render
from .schema import Resume
from .augmenters.entities import EntityAugmenter
from .augmenters.text import TextAugmenter
from .augmenters.layout import LayoutAugmenter
from .augmenters.llm import LLMTextAugmenter


@dataclass
class Example:
    example_id: str
    source_id: str
    text: str
    tokens: List[str]
    ents: List[str]
    spans: List[dict] = field(default_factory=list)
    augmentations: List[str] = field(default_factory=list)


class ResumeAugmenter:
    def __init__(self, cfg: Optional[AugmentConfig] = None):
        self.cfg = cfg or AugmentConfig()
        self.rng = random.Random(self.cfg.seed)
        self.entities = EntityAugmenter(self.cfg, self.rng)
        self.text = TextAugmenter(self.cfg, self.rng)
        self.llm = LLMTextAugmenter(self.cfg, self.rng)
        self.layout = LayoutAugmenter(self.cfg, self.rng)

    def _augment_once(self, resume: Resume):
        r = copy.deepcopy(resume)
        ops: List[str] = []
        r, o = self.entities.augment(r); ops += o
        r, o = self.text.augment(r); ops += o
        r, o = self.llm.augment(r); ops += o
        r, settings, o = self.layout.augment(r); ops += o
        return render(r, settings), ops

    @staticmethod
    def _make(resume: Resume, idx: int, rendered: Rendered, ops: List[str]) -> Example:
        return Example(
            example_id=f"{resume.resume_id}-{idx:03d}",
            source_id=resume.resume_id,
            text=rendered.text,
            tokens=rendered.tokens,
            ents=rendered.ents,
            spans=rendered.spans,
            augmentations=ops,
        )

    def generate(self, resume: Resume) -> List[Example]:
        examples: List[Example] = []
        seen = set()
        if self.cfg.include_original:
            base = render(resume)
            examples.append(self._make(resume, 0, base, ["original"]))
            seen.add(base.text)

        target = self.cfg.variants_per_resume
        produced, attempts = 0, 0
        while produced < target and attempts < target * 10:
            attempts += 1
            rendered, ops = self._augment_once(resume)
            if not ops or rendered.text in seen:
                continue  # skip no-op or duplicate variants
            seen.add(rendered.text)
            produced += 1
            examples.append(self._make(resume, produced, rendered, ops))
        return examples
