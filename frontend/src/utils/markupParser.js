import { VALID_ENTITY_KEYS, VALID_SECTION_KEYS } from '../data/entityTheme';

/**
 * Calculates 1-based line number for a character index in text.
 */
function getLineNumber(text, index) {
  if (index < 0) return 1;
  return text.substring(0, index).split('\n').length;
}

/**
 * Validates and parses raw markup text into an AST of sections, items, and segments.
 * Provides line-numbered, plain-language error descriptions with actionable suggestions.
 */
export function validateAndParseMarkup(text) {
  const errors = [];
  const warnings = [];
  const sections = [];
  const entitiesFound = [];

  if (!text || !text.trim()) {
    return {
      isValid: false,
      errors: [
        {
          line: 1,
          type: 'empty',
          message: 'Markup text is currently empty.',
          suggestion: 'Click "Load Sample" to insert a fully labeled demo resume, or paste your resume text.',
        },
      ],
      warnings: [],
      sections: [],
      entities: [],
      entityCounts: {},
    };
  }

  // 1. Tag Balance and Label Validation
  const tagRegex = /<\/?([A-Za-z_]+)>/g;
  const tagStack = [];
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    const fullTag = match[0];
    const rawTag = match[1];
    const tagName = rawTag.toUpperCase();
    const isClosing = fullTag.startsWith('</');
    const line = getLineNumber(text, match.index);

    if (!VALID_ENTITY_KEYS.includes(tagName)) {
      warnings.push({
        line,
        type: 'unknown_label',
        message: `Line ${line}: Unknown entity label <${rawTag}>. '${rawTag}' is not recognized by the standard HR schema.`,
        suggestion: `Replace <${rawTag}> with one of: ${VALID_ENTITY_KEYS.join(', ')}.`,
        tag: rawTag,
      });
    }

    if (isClosing) {
      if (tagStack.length === 0) {
        errors.push({
          line,
          type: 'unmatched_close',
          message: `Line ${line}: Unexpected closing tag </${rawTag}> with no prior opening tag.`,
          suggestion: `Remove </${rawTag}> or insert an opening <${rawTag}> before the entity text.`,
          tag: rawTag,
        });
      } else {
        const lastOpen = tagStack.pop();
        if (lastOpen.name !== tagName) {
          errors.push({
            line,
            type: 'mismatched_tag',
            message: `Line ${line}: Mismatched tag pair: <${lastOpen.raw}> on line ${lastOpen.line} was closed with </${rawTag}>.`,
            suggestion: `Change </${rawTag}> on line ${line} to </${lastOpen.name}> to match the opening tag.`,
            tag: rawTag,
          });
        }
      }
    } else {
      tagStack.push({ name: tagName, raw: rawTag, index: match.index, line });
    }
  }

  // Remaining unclosed tags
  while (tagStack.length > 0) {
    const unclosed = tagStack.pop();
    errors.push({
      line: unclosed.line,
      type: 'unclosed_tag',
      message: `Line ${unclosed.line}: Unclosed tag <${unclosed.raw}>. The opening tag has no matching closing tag.`,
      suggestion: `Append </${unclosed.name}> immediately after the entity text on line ${unclosed.line}.`,
      tag: unclosed.raw,
    });
  }

  // 2. Section Header Validation & AST Extraction
  const lines = text.split('\n');
  let currentSection = null;
  const sectionHeaderRegex = /^##\s+\[(.*?)\]\s*(.*)$/;
  const looseHeaderRegex = /^##\s+([^\[\n]+)$/;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx].trimEnd();
    const trimmed = line.trim();
    const lineNum = lineIdx + 1;

    if (!trimmed || trimmed.startsWith('===')) {
      continue;
    }

    // Check for standard section header
    const headerMatch = line.match(sectionHeaderRegex);
    if (headerMatch) {
      const sectionKey = headerMatch[1].trim().toLowerCase();
      const sectionTitle = headerMatch[2].trim() || sectionKey.toUpperCase();

      if (!VALID_SECTION_KEYS.includes(sectionKey)) {
        warnings.push({
          line: lineNum,
          type: 'uncommon_section_key',
          message: `Line ${lineNum}: Section key '[${sectionKey}]' is non-standard.`,
          suggestion: `Consider using standard keys (${VALID_SECTION_KEYS.join(', ')}) for better parser generalization.`,
          key: sectionKey,
        });
      }

      currentSection = {
        key: sectionKey,
        title: sectionTitle,
        line: lineNum,
        items: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Check for malformed section header (e.g. ## Experience without [experience])
    const looseMatch = line.match(looseHeaderRegex);
    if (looseMatch) {
      const rawTitle = looseMatch[1].trim();
      const guessedKey = rawTitle.toLowerCase().split(/\s+/)[0];
      warnings.push({
        line: lineNum,
        type: 'malformed_header',
        message: `Line ${lineNum}: Header "## ${rawTitle}" is missing the bracketed section key.`,
        suggestion: `Change "## ${rawTitle}" to "## [${guessedKey}] ${rawTitle}".`,
      });

      currentSection = {
        key: guessedKey,
        title: rawTitle,
        line: lineNum,
        items: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Check for orphan text before any section header
    if (!currentSection) {
      warnings.push({
        line: lineNum,
        type: 'orphan_content',
        message: `Line ${lineNum}: Text appears before any section header.`,
        suggestion: `Add "## [contact] Contact Information" at the top of your resume on line 1.`,
      });
      currentSection = {
        key: 'contact',
        title: 'CONTACT',
        line: lineNum,
        items: [],
      };
      sections.push(currentSection);
    }

    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
    const rawContent = isBullet ? trimmed.replace(/^[-*•]\s+/, '') : trimmed;

    // Parse segments inside the line
    const segments = parseLineSegments(rawContent);
    segments.forEach((seg) => {
      if (seg.label) {
        entitiesFound.push({
          label: seg.label,
          text: seg.text,
          section: currentSection.key,
          line: lineNum,
        });
      }
    });

    currentSection.items.push({
      bullet: isBullet,
      raw: rawContent,
      segments,
    });
  }

  // Aggregate entity counts
  const entityCounts = {};
  VALID_ENTITY_KEYS.forEach((k) => (entityCounts[k] = 0));
  entitiesFound.forEach((e) => {
    entityCounts[e.label] = (entityCounts[e.label] || 0) + 1;
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sections,
    entities: entitiesFound,
    entityCounts,
    totalEntities: entitiesFound.length,
    totalSections: sections.length,
  };
}

/**
 * Parses a single line with <LABEL>content</LABEL> into an array of segments.
 */
export function parseLineSegments(lineText) {
  const segments = [];
  const regex = /<([A-Za-z_]+)>(.*?)<\/\1>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(lineText)) !== null) {
    const preText = lineText.slice(lastIndex, match.index);
    if (preText) {
      segments.push({ text: preText, label: null });
    }

    segments.push({
      text: match[2],
      label: match[1].toUpperCase(),
    });

    lastIndex = regex.lastIndex;
  }

  const postText = lineText.slice(lastIndex);
  if (postText) {
    segments.push({ text: postText, label: null });
  }

  return segments.length > 0 ? segments : [{ text: lineText, label: null }];
}

/**
 * Automatically converts raw unformatted resume text into standard markup format with sections and bullets.
 */
export function autoFormatPlainText(plainText) {
  if (!plainText || !plainText.trim()) return plainText;

  const lines = plainText.split('\n');
  const formattedLines = [];
  let currentSection = null;

  const SECTION_KEYWORDS = {
    contact: ['contact', 'contact info', 'personal info', 'personal details'],
    summary: ['summary', 'profile', 'professional summary', 'executive summary', 'about me'],
    experience: ['experience', 'work experience', 'employment history', 'work history', 'career history'],
    education: ['education', 'academic background', 'qualifications', 'academics'],
    skills: ['skills', 'technical skills', 'core competencies', 'technologies', 'expertise'],
    projects: ['projects', 'key projects', 'academic projects'],
    certifications: ['certifications', 'licenses', 'certificates'],
  };

  const isHeading = (trimmed) => {
    const lower = trimmed.toLowerCase().replace(/[:#]/g, '').trim();
    for (const [key, aliases] of Object.entries(SECTION_KEYWORDS)) {
      if (aliases.includes(lower)) {
        return { key, title: trimmed.replace(/[:#]/g, '').trim() };
      }
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    const headingInfo = isHeading(trimmed);
    if (headingInfo) {
      formattedLines.push('');
      formattedLines.push(`## [${headingInfo.key}] ${headingInfo.title}`);
      currentSection = headingInfo.key;
      continue;
    }

    if (!currentSection && i < 4) {
      // Top lines before any header become Contact section
      formattedLines.push('## [contact] Contact Information');
      currentSection = 'contact';
    }

    // Format bullet lines under experience / projects
    if (currentSection === 'experience' || currentSection === 'projects') {
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        formattedLines.push(`- ${trimmed.replace(/^[-*•]\s*/, '')}`);
      } else if (trimmed.length > 30 && !trimmed.includes('20') && !trimmed.toLowerCase().includes('present')) {
        formattedLines.push(`- ${trimmed}`);
      } else {
        formattedLines.push(trimmed);
      }
    } else {
      formattedLines.push(trimmed);
    }
  }

  return formattedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
