import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitCompare } from 'lucide-react';
import { computeWordDiff } from '../../utils/diffUtils';

export function ComparisonModal({ isOpen, onClose, originalResume, variant }) {
  const [activeTab, setActiveTab] = useState('sideBySide'); // 'sideBySide' | 'diff'

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !variant) return null;

  const origText = variant.original_text || originalResume.sections.map(s => {
    const items = s.items.map(it => (it.bullet ? `• ${it.raw}` : it.raw)).join('\n');
    return `${s.title.toUpperCase()}\n${items}`;
  }).join('\n\n');

  const augText = variant.text || '';
  const diffTokens = computeWordDiff(origText, augText);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/80">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Variant Inspection:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{variant.variant_id || variant.id}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {variant.ops ? variant.ops.join(' · ') : 'Augmented layout & wording variation'}
                </p>
              </div>
            </div>

            {/* View Mode Toggle & Close Button */}
            <div className="flex items-center space-x-3">
              <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('sideBySide')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'sideBySide'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diff')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'diff'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Visual Word Diff
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white dark:bg-slate-900">
            {activeTab === 'sideBySide' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Resume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      Original Base Template
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Baseline Form</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200 shadow-2xs">
                    {origText}
                  </div>
                </div>

                {/* Augmented Variant */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider font-mono">
                      Augmented Variant ({variant.num_tokens} tokens)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Entity Aligned (100%)
                    </span>
                  </div>
                  <div className="bg-indigo-50/30 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 text-xs font-mono leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-slate-800 dark:text-slate-200 shadow-2xs">
                    {augText}
                  </div>
                </div>
              </div>
            ) : (
              /* Token-level Word Diff View */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-400 dark:border-emerald-600" />
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold">Added Words / Formatting</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-900/60 border border-rose-400 dark:border-rose-600" />
                      <span className="text-rose-800 dark:text-rose-300 font-bold">Replaced / Removed Wording</span>
                    </span>
                  </div>
                  <span className="text-slate-400">Exact token-by-token comparison</span>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono leading-loose max-h-[60vh] overflow-y-auto text-slate-800 dark:text-slate-200">
                  {diffTokens.map((tok, tIdx) => {
                    if (tok.type === 'added') {
                      return (
                        <span
                          key={tIdx}
                          className="bg-emerald-100 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-700 mx-0.5"
                        >
                          {tok.text}
                        </span>
                      );
                    }
                    if (tok.type === 'deleted') {
                      return (
                        <span
                          key={tIdx}
                          className="bg-rose-100 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200 line-through px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-700 opacity-75 mx-0.5"
                        >
                          {tok.text}
                        </span>
                      );
                    }
                    return <span key={tIdx}>{tok.text}</span>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] shadow-2xs font-bold text-slate-700 dark:text-slate-200">Esc</kbd> to close
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-colors cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
