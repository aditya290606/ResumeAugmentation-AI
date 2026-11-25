import React, { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileSpreadsheet, FileCode, ChevronDown } from 'lucide-react';
import { exportDatasetAsJsonl, exportDatasetAsCsv, exportDatasetAsSpacy } from '../../utils/exportUtils';

export function ExportMenu({ variants, onExportSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = variants.length;

  const handleExport = (format) => {
    if (!count) return;

    if (format === 'jsonl') {
      exportDatasetAsJsonl(variants);
      onExportSuccess?.('Exported dataset as augmented_dataset.jsonl');
    } else if (format === 'csv') {
      exportDatasetAsCsv(variants);
      onExportSuccess?.('Exported summary as augmented_summary.csv');
    } else if (format === 'spacy') {
      exportDatasetAsSpacy(variants);
      onExportSuccess?.('Exported spaCy format annotations as spacy_annotations.json');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        disabled={count === 0}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <Download className="w-4 h-4 text-white" />
        <span>Export Dataset ({count})</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-2xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 focus:outline-hidden z-30 overflow-hidden">
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => handleExport('jsonl')}
              className="w-full text-left flex items-start space-x-3 p-2.5 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileJson className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  JSONL (Tokens & Tags)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Token arrays, IOB tags, and operations
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="w-full text-left flex items-start space-x-3 p-2.5 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  CSV Summary Table
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Entity counts, token stats, and ops
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleExport('spacy')}
              className="w-full text-left flex items-start space-x-3 p-2.5 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  spaCy DocBin Annotations
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Char offsets for spacy train NER pipeline
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
