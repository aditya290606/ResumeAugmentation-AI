"""Wording variation applied ONLY to non-entity (label=None) text.

Entity segments are never edited here, so entity values stay intact.
Synonym replacement uses nlpaug's WordNet-based SynonymAug.
"""
import random

VERB_BANK = {
    # Engineering & Building
    "developed": ["built", "engineered", "designed", "created", "implemented", "constructed"],
    "built": ["developed", "created", "engineered", "constructed", "architected"],
    "engineered": ["developed", "built", "designed", "implemented"],
    "designed": ["architected", "developed", "engineered", "formulated"],
    "implemented": ["deployed", "delivered", "executed", "integrated", "rolled out"],
    "deployed": ["released", "launched", "shipped", "installed"],
    "architected": ["designed", "engineered", "structured", "modeled"],
    "created": ["built", "authored", "developed", "produced"],
    "authored": ["wrote", "drafted", "published", "created"],

    # Leadership & Management
    "led": ["managed", "directed", "headed", "spearheaded", "guided", "steered"],
    "managed": ["led", "oversaw", "supervised", "directed", "coordinated"],
    "oversaw": ["managed", "supervised", "directed", "monitored"],
    "spearheaded": ["led", "pioneered", "championed", "initiated"],
    "directed": ["managed", "guided", "led", "steered"],
    "coordinated": ["organized", "managed", "facilitated", "aligned"],

    # Optimization & Enhancement
    "improved": ["enhanced", "optimized", "boosted", "elevated", "upgraded"],
    "enhanced": ["improved", "optimized", "refined", "strengthened"],
    "optimized": ["streamlined", "enhanced", "improved", "tuned", "accelerated"],
    "reduced": ["lowered", "decreased", "minimized", "cut", "slashed"],
    "increased": ["raised", "boosted", "elevated", "amplified"],
    "streamlined": ["optimized", "simplified", "accelerated", "consolidated"],
    "automated": ["digitized", "scripted", "programmed", "streamlined"],

    # Analysis & Research
    "analyzed": ["examined", "evaluated", "investigated", "assessed", "audited"],
    "evaluated": ["analyzed", "assessed", "reviewed", "benchmarked"],
    "investigated": ["explored", "analyzed", "researched", "examined"],
    "researched": ["investigated", "explored", "studied"],
    "identified": ["discovered", "uncovered", "pinpointed", "detected"],

    # Collaboration & Support
    "worked": ["collaborated", "partnered", "cooperated"],
    "collaborated": ["partnered", "worked closely", "cooperated", "teamed up"],
    "assisted": ["supported", "aided", "helped"],
    "maintained": ["sustained", "supported", "administered", "kept"],
    "shipped": ["delivered", "released", "launched", "deployed"],
}

KEYBOARD_NEIGHBORS = {
    "a": "qwsz", "e": "wrsd", "i": "uojk", "o": "iplk", "n": "bmhj",
    "s": "awedxz", "t": "ryfg", "r": "etdf", "l": "kop", "c": "xdfv",
    "d": "serfcx", "u": "yhji", "m": "njk", "h": "gyjn", "w": "qase",
    "p": "ol", "b": "vghn", "g": "rtyhvb", "v": "cfgb",
}

OCR_CONFUSIONS = {
    "l": "1", "1": "l", "o": "0", "0": "o", "rn": "m", "cl": "d",
}

TRANSITIONAL_PREFIXES = [
    "Successfully",
    "Directly",
    "Actively",
    "Collaborated to",
    "Led efforts to",
    "Assisted team in",
    "Tasked with helping to",
]


class TextAugmenter:
    def __init__(self, cfg, rng: random.Random):
        self.cfg = cfg
        self.rng = rng
        self._synonym = None
        if cfg.use_nlpaug:
            try:
                import nlpaug.augmenter.word as naw
                self._synonym = naw.SynonymAug(aug_src="wordnet", aug_p=cfg.synonym_word_p)
            except Exception as exc:  # nlpaug missing or misconfigured
                print(f"[warn] nlpaug unavailable ({exc}); synonym augmentation disabled")

    def _synonymize(self, text):
        if self._synonym is None:
            return text, False
        try:
            out = self._synonym.augment(text)
        except LookupError:
            print("[warn] WordNet missing. Run: python -m nltk.downloader wordnet omw-1.4") 
            self._synonym = None
            return text, False
        if isinstance(out, list):
            out = out[0] if out else text
        return out, out != text

    def _swap_leading_verb(self, text):
        parts = text.split(maxsplit=1)
        if not parts:
            return text, False
        first = parts[0]
        key = first.lower().rstrip(".,;:")
        if key not in VERB_BANK:
            return text, False
        new = self.rng.choice(VERB_BANK[key])
        if first[0].isupper():
            new = new.capitalize()
        rest = parts[1] if len(parts) > 1 else ""
        return (new + (" " + rest if rest else "")), True

    def _typo(self, word):
        if len(word) < 5 or not word.isalpha():
            return word
        i = self.rng.randrange(1, len(word) - 1)
        op = self.rng.choice(["swap", "drop", "key", "ocr"])
        if op == "swap":
            return word[:i] + word[i + 1] + word[i] + word[i + 2:]
        if op == "drop":
            return word[:i] + word[i + 1:]
        if op == "ocr":
            char = word[i].lower()
            if char in OCR_CONFUSIONS:
                rep = OCR_CONFUSIONS[char]
                return word[:i] + rep + word[i + 1:]
        neighbors = KEYBOARD_NEIGHBORS.get(word[i].lower())
        if not neighbors:
            return word
        return word[:i] + self.rng.choice(neighbors) + word[i + 1:]

    def _vary_punctuation(self, text):
        clean = text.rstrip()
        if clean.endswith("."):
            return clean[:-1], True
        elif clean and clean[-1].isalnum():
            return clean + ".", True
        return text, False

    def augment(self, resume):
        ops = []
        cfg, rng = self.cfg, self.rng

        for section in resume.sections:
            if section.key == "contact":
                continue

            for item in section.items:
                # 1. Action verb swap on bullet item
                if item.segments and item.segments[0].label is None and rng.random() < cfg.verb_swap_p:
                    seg = item.segments[0]
                    new, changed = self._swap_leading_verb(seg.text)
                    if changed:
                        seg.text = new
                        ops.append("verb_swap")

                # 2. Add transitional prefix (e.g. "Successfully built...")
                if item.bullet and item.segments and item.segments[0].label is None and rng.random() < cfg.bullet_prefix_p:
                    seg = item.segments[0]
                    prefix = rng.choice(TRANSITIONAL_PREFIXES)
                    # Lowercase previous leading word if needed
                    words = seg.text.split(maxsplit=1)
                    if words:
                        first_lower = words[0].lower()
                        rest = (" " + words[1]) if len(words) > 1 else ""
                        seg.text = f"{prefix} {first_lower}{rest}"
                        ops.append("transitional_prefix")

                # 3. Synonym replacement & typos per segment
                for seg in item.segments:
                    if seg.label is not None or not seg.text.strip():
                        continue

                    if rng.random() < cfg.synonym_segment_p:
                        new, changed = self._synonymize(seg.text)
                        if changed:
                            seg.text = new
                            ops.append("synonym")

                    words = seg.text.split()
                    typo_hit = False
                    for idx, w in enumerate(words):
                        if rng.random() < cfg.typo_word_p:
                            t = self._typo(w)
                            if t != w:
                                words[idx] = t
                                typo_hit = True
                    if typo_hit:
                        seg.text = " ".join(words)
                        ops.append("typo")

                # 4. Trailing punctuation variation
                if item.segments and item.segments[-1].label is None and rng.random() < cfg.punctuation_p:
                    last_seg = item.segments[-1]
                    new, changed = self._vary_punctuation(last_seg.text)
                    if changed:
                        last_seg.text = new
                        ops.append("punctuation")

        return resume, ops
