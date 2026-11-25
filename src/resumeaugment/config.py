from dataclasses import dataclass


@dataclass
class AugmentConfig:
    variants_per_resume: int = 20      # augmented variants generated per base resume
    include_original: bool = True      # also emit the un-augmented rendering
    seed: int = 42
    use_nlpaug: bool = True            # WordNet synonym replacement via nlpaug
    use_llm: bool = False              # Generative AI / LLM bullet phrasing mode

    # text-level probabilities (applied only to non-entity text)
    verb_swap_p: float = 0.4           # swap leading action verb in a bullet
    synonym_segment_p: float = 0.5     # chance a text segment is passed to nlpaug
    synonym_word_p: float = 0.2        # per-word replacement rate inside nlpaug
    typo_word_p: float = 0.03          # per-word OCR/keyboard-style typo rate
    bullet_prefix_p: float = 0.25      # add realistic transitional phrases ("Led effort to", etc.)
    punctuation_p: float = 0.3         # vary trailing punctuation on bullets

    # entity-level probabilities (label is kept, surface form changes)
    phone_p: float = 0.8
    date_p: float = 0.8
    company_suffix_p: float = 0.4      # expand or vary company suffixes (Inc., LLC, Technologies)
    degree_p: float = 0.4              # vary degree abbreviation vs full title

    # layout-level probabilities
    header_rename_p: float = 0.6
    header_upper_p: float = 0.2
    header_style_p: float = 0.3        # apply stylized headers (underlined, bracketed, dashed)
    contact_multiline_p: float = 0.35  # toggle between multi-line and single-line contact layouts
    reorder_sections_p: float = 0.4
    merge_skills_p: float = 0.3
    bullet_style_p: float = 0.2        # switch between symbols (•, -, *), numbered, or clean
