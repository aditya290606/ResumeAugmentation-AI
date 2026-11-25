import React from 'react';
import { BookOpen, Check, X, Tag, List, Layout } from 'lucide-react';
import { VALID_ENTITY_KEYS } from '../../data/entityTheme';

export function FormatGuidePanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 p-5 shadow-md space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold">
          <BookOpen className="w-4 h-4" />
          <span className="uppercase tracking-wider font-mono">Resume Markup Specification Guide</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Close Guide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rule 1: Section Headers */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
            <Layout className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>1. Section Headers</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Every section must start with <code className="font-mono text-indigo-700 dark:text-indigo-400 font-bold">## [key] Title</code>.
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center space-x-1 text-emerald-700 dark:text-emerald-400">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>## [experience] Work History</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-700 dark:text-rose-400">
              <X className="w-3 h-3 text-rose-500 shrink-0" />
              <span>## Work History (Missing key)</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            Standard keys: contact, summary, experience, education, skills, projects.
          </p>
        </div>

        {/* Rule 2: Bullet Points */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
            <List className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>2. Bullet Points</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Use a leading hyphen <code className="font-mono text-violet-700 dark:text-violet-400 font-bold">- </code> for experience bullet points.
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center space-x-1 text-emerald-700 dark:text-emerald-400">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>- Built ML model with &lt;SKILL&gt;PyTorch&lt;/SKILL&gt;.</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Augmenters swap verbs and mutate bullet styling safely.
          </p>
        </div>

        {/* Rule 3: Entity Tags */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-slate-100 font-mono">
            <Tag className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>3. Entity Spans</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Wrap text with matching opening and closing tags <code className="font-mono text-sky-700 dark:text-sky-400 font-bold">&lt;LABEL&gt;text&lt;/LABEL&gt;</code>.
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {VALID_ENTITY_KEYS.slice(0, 10).map((k) => (
              <span key={k} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                &lt;{k}&gt;
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

