/**
 * Mock Data Module for standalone offline mode and fallback.
 */

export const MOCK_KPIS = {
  baseResumes: 10,
  augmentedExamples: 160,
  avgVariantsPerResume: 16,
};

export const MOCK_EVALUATION = {
  baseline: {
    precision: 53.8,
    recall: 32.3,
    f1: 40.4,
    size: 10,
  },
  augmented: {
    precision: 80.4,
    recall: 69.2,
    f1: 74.4,
    size: 160,
  },
  deltaF1: '+34.0',
  deltaPercent: '+84.2%',
  note: 'Evaluation conducted on held-out test resumes featuring entirely unseen layouts, non-standard section titles, reversed chronology, and international date/phone representations.',
  entityBreakdown: [
    { entity: 'PHONE', baselineF1: 45.0, augmentedF1: 100.0, delta: '+55.0%', support: 4 },
    { entity: 'DEGREE', baselineF1: 52.0, augmentedF1: 100.0, delta: '+48.0%', support: 4 },
    { entity: 'DATE', baselineF1: 61.2, augmentedF1: 94.7, delta: '+33.5%', support: 9 },
    { entity: 'EMAIL', baselineF1: 72.0, augmentedF1: 88.9, delta: '+16.9%', support: 5 },
    { entity: 'SKILL', baselineF1: 41.5, augmentedF1: 75.7, delta: '+34.2%', support: 19 },
    { entity: 'COMPANY', baselineF1: 38.0, augmentedF1: 75.0, delta: '+37.0%', support: 5 },
    { entity: 'LOCATION', baselineF1: 30.0, augmentedF1: 57.1, delta: '+27.1%', support: 5 },
    { entity: 'COLLEGE', baselineF1: 28.5, augmentedF1: 54.5, delta: '+26.0%', support: 4 },
    { entity: 'DESIGNATION', baselineF1: 22.0, augmentedF1: 44.4, delta: '+22.4%', support: 5 },
  ],
};

const ACTION_VERBS = ['Spearheaded', 'Engineered', 'Architected', 'Orchestrated', 'Delivered', 'Pioneered', 'Formulated'];
const HEADER_SYNONYMS = {
  experience: ['EMPLOYMENT HISTORY', 'CAREER BACKGROUND', 'RELEVANT EXPERIENCE', 'EXPERIENCE SUMMARY'],
  education: ['ACADEMIC BACKGROUND', 'EDUCATION & CREDENTIALS', 'QUALIFICATIONS'],
  skills: ['TECHNICAL EXPERTISE', 'CORE STRENGTHS', 'TECHNOLOGY STACK'],
  contact: ['CONTACT DETAILS', 'GET IN TOUCH', 'REACH OUT'],
};

/**
 * Generates realistic fake augmented variants client-side if backend is offline.
 */
export function generateMockVariants(parsedResume, count = 5, sliders = {}) {
  const variants = [];
  const origText = parsedResume.sections.map(s => {
    const items = s.items.map(it => (it.bullet ? `• ${it.raw}` : it.raw)).join('\n');
    return `${s.title.toUpperCase()}\n${items}`;
  }).join('\n\n');

  for (let i = 1; i <= count; i++) {
    const ops = [];
    const sectionsCopy = JSON.parse(JSON.stringify(parsedResume.sections));

    // Simulate section reorder
    if (Math.random() < (sliders.reorder_sections_p || 0.4)) {
      if (sectionsCopy.length > 2) {
        const idx1 = 1;
        const idx2 = sectionsCopy.length - 1;
        const tmp = sectionsCopy[idx1];
        sectionsCopy[idx1] = sectionsCopy[idx2];
        sectionsCopy[idx2] = tmp;
        ops.push('section_reorder');
      }
    }

    // Simulate header rename
    if (Math.random() < (sliders.header_rename_p || 0.6)) {
      sectionsCopy.forEach(s => {
        if (HEADER_SYNONYMS[s.key]) {
          const list = HEADER_SYNONYMS[s.key];
          s.title = list[i % list.length];
        }
      });
      ops.push('header_rename');
    }

    // Simulate verb swap
    if (Math.random() < (sliders.verb_swap_p || 0.5)) {
      sectionsCopy.forEach(s => {
        s.items.forEach(it => {
          if (it.bullet && it.raw.length > 10) {
            const verb = ACTION_VERBS[(i + it.raw.length) % ACTION_VERBS.length];
            const words = it.raw.split(' ');
            words[0] = verb;
            it.raw = words.join(' ');
          }
        });
      });
      ops.push('verb_swap');
    }

    // Phone / date formats
    if (Math.random() < (sliders.phone_p || 0.7)) {
      ops.push('phone_format_variant');
    }
    if (Math.random() < (sliders.date_p || 0.7)) {
      ops.push('date_range_iso');
    }
    if (Math.random() < (sliders.typo_word_p || 0.05)) {
      ops.push('ocr_typo_confusion');
    }
    if (Math.random() < (sliders.merge_skills_p || 0.3)) {
      ops.push('skill_inline_pipe');
    }

    const varText = sectionsCopy.map(s => {
      const items = s.items.map(it => (it.bullet ? `- ${it.raw}` : it.raw)).join('\n');
      return `${s.title}\n${items}`;
    }).join('\n\n');

    // Build entity spans
    const spans = [];
    sectionsCopy.forEach(s => {
      s.items.forEach(it => {
        (it.segments || []).forEach(seg => {
          if (seg.label) {
            spans.push({ label: seg.label, text: seg.text, start: 0, end: seg.text.length });
          }
        });
      });
    });

    variants.push({
      id: `var_${parsedResume.id || 'r001'}_${i.toString().padStart(3, '0')}`,
      variant_id: `var_${parsedResume.id || 'r001'}_${i.toString().padStart(3, '0')}`,
      resume_id: parsedResume.id || 'r001',
      text: varText,
      original_text: origText,
      sections: sectionsCopy,
      ops: ops.length > 0 ? ops : ['structural_alignment'],
      spans,
      num_tokens: varText.split(/\s+/).length,
      num_entities: spans.length,
      created_at: new Date().toISOString(),
    });
  }

  return variants;
}

