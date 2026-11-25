import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Wand2,
  BookOpen,
  AlignLeft,
  RotateCcw,
  Eye,
  Edit3,
} from 'lucide-react';
import { SAMPLE_RESUMES } from '../../data/sampleResumes';
import { VALID_ENTITY_KEYS } from '../../data/entityTheme';
import { ResumeRenderer } from './ResumeRenderer';
import { ValidationPanel } from './ValidationPanel';
import { FormatGuidePanel } from './FormatGuidePanel';
import { EntityChip } from '../common/EntityChip';
import { autoFormatPlainText } from '../../utils/markupParser';

export function ResumeEditor({
  markup,
  onMarkupChange,
  validationResult,
  onLoadSample,
  onNotify,
}) {
  const [copied, setCopied] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
  const textareaRef = useRef(null);

  // Auto-save to localStorage on change
  const handleTextChange = (newVal) => {
    onMarkupChange(newVal);
    try {
      localStorage.setItem('resumeaugment_editor_markup', newVal);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markup);
    setCopied(true);
    onNotify?.('Markup copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToDefault = () => {
    const defaultSample = SAMPLE_RESUMES[0].markup;
    handleTextChange(defaultSample);
    onNotify?.('Reset to default annotated sample resume', 'info');
  };

  const handleAutoFormat = () => {
    const formatted = autoFormatPlainText(markup);
    handleTextChange(formatted);
    onNotify?.('Converted text into structured sections and bullets', 'success');
  };

  const handleSuggestLabels = async () => {
    setIsSuggesting(true);
    onNotify?.('Analyzing text to suggest entity labels...', 'info');

    try {
      const res = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: markup }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggested_markup) {
          handleTextChange(data.suggested_markup);
          onNotify?.(`Pre-filled ${data.total_tags || 0} entity labels across sections!`, 'success');
        }
      } else {
        throw new Error('Server returned non-200');
      }
    } catch {
      // Client-side quick tag suggestion fallback
      let clientTagged = markup;
      const skills = ['Python', 'spaCy', 'PyTorch', 'Docker', 'FastAPI', 'Kubernetes', 'SQL', 'React', 'TypeScript'];
      skills.forEach((s) => {
        if (!clientTagged.includes(`<SKILL>${s}</SKILL>`)) {
          clientTagged = clientTagged.replace(new RegExp(`\\b${s}\\b`, 'g'), `<SKILL>${s}</SKILL>`);
        }
      });
      handleTextChange(clientTagged);
      onNotify?.('Pre-filled common entity tags (Offline Mode)', 'success');
    } finally {
      setIsSuggesting(false);
    }
  };

  const insertTag = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markup.substring(start, end);

    const replacement = selected
      ? `<${tag}>${selected}</${tag}>`
      : `<${tag}>value</${tag}>`;

    const newText = markup.substring(0, start) + replacement + markup.substring(end);
    handleTextChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = selected ? start + replacement.length : start + tag.length + 2;
      textarea.setSelectionRange(newPos, newPos + (selected ? 0 : 5));
    }, 10);
  };

  return (
    <div className="space-y-3">
      {/* Clean Top Action Bar without redundant headers */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        {/* Left: Sample Selector & Stats */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sample:</span>
            <select
              onChange={(e) => {
                const found = SAMPLE_RESUMES.find((s) => s.id === e.target.value);
                if (found) {
                  handleTextChange(found.markup);
                  onNotify?.(`Loaded "${found.title}"`, 'success');
                }
              }}
              defaultValue="r001"
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {SAMPLE_RESUMES.map((sample) => (
                <option key={sample.id} value={sample.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {sample.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            {markup.split('\n').length} lines · {markup.length} chars
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Suggest Labels / Auto-Tag Button */}
          <button
            type="button"
            disabled={isSuggesting}
            onClick={handleSuggestLabels}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Automatically detect names, skills, dates, companies, and degrees"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
            <span>{isSuggesting ? 'Tagging...' : 'Suggest Labels'}</span>
          </button>

          {/* Auto-Format Plain Text Button */}
          <button
            type="button"
            onClick={handleAutoFormat}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Convert raw unformatted text into sections and bullets"
          >
            <AlignLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Auto-Format</span>
          </button>

          {/* Format Guide Button */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Format Guide</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Copy markup"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetToDefault}
            title="Reset to default sample"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Format Guide Panel Dropdown */}
      <FormatGuidePanel isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* Quick Tag Insert Toolbar */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Insert Tag:
        </span>
        {VALID_ENTITY_KEYS.slice(0, 10).map((key) => (
          <EntityChip
            key={key}
            label={key}
            size="xs"
            onClick={() => insertTag(key)}
          />
        ))}
      </div>

      {/* Mobile / Tablet Segmented Switcher (Visible on < lg, hidden on lg+) */}
      <div className="lg:hidden flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            mobileTab === 'editor' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Markup</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            mobileTab === 'preview' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview & Linter</span>
        </button>
      </div>

      {/* Split View: Editor & Live Preview (Responsive from 360px up to 1920px) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left: Raw Markup Input */}
        <div className={`space-y-3 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={markup}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste or write labeled resume markup..."
              rows={28}
              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 shadow-xs resize-y selection:bg-indigo-500/20"
              spellCheck="false"
            />
          </div>

          {/* Syntax Cheat Sheet */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap gap-4 font-mono shadow-xs font-semibold">
            <span className="text-indigo-700 dark:text-indigo-400">## [section] Header</span>
            <span>- Bullet point</span>
            <span className="text-lime-700 dark:text-lime-400">&lt;SKILL&gt;Python&lt;/SKILL&gt;</span>
            <span className="text-orange-700 dark:text-orange-400">&lt;COMPANY&gt;Acme&lt;/COMPANY&gt;</span>
          </div>
        </div>

        {/* Right: Live Preview & Validation Panel */}
        <div className={`space-y-4 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <ValidationPanel validationResult={validationResult} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Live Document Preview
              </span>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/60">
                Exact NER Spans
              </span>
            </div>
            <ResumeRenderer sections={validationResult.sections} />
          </div>
        </div>
      </div>
    </div>
  );
}
