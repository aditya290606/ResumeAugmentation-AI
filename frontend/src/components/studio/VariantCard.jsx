import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Hash } from 'lucide-react';

export function VariantCard({ variant, index, onCompare }) {
  const ops = variant.ops || [];
  const preview = variant.text || '';
  const lines = preview.split('\n').filter((l) => l.trim().length > 0).slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      onClick={() => onCompare(variant)}
      className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.08)] hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs shadow-indigo-500/40" />
            <span>{variant.variant_id || variant.id || `var_${index + 1}`}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-0.5">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{variant.num_tokens || preview.split(/\s+/).length} tok</span>
            </span>
            <span>·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
              {variant.num_entities || (variant.spans ? variant.spans.length : 0)} ents
            </span>
          </div>
        </div>

        {/* Applied Operations Chips */}
        <div className="flex flex-wrap gap-1">
          {ops.map((op, oIdx) => (
            <span
              key={oIdx}
              className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
            >
              {op.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        {/* Document Preview Snippet */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 leading-relaxed overflow-hidden h-32 space-y-0.5">
          {lines.map((line, lIdx) => (
            <p key={lIdx} className="truncate">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Card Action footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center space-x-1 font-medium">
          <Eye className="w-3.5 h-3.5" />
          <span>Click to compare with original</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCompare(variant);
          }}
          className="px-3 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer"
        >
          Inspect Diff
        </button>
      </div>
    </motion.div>
  );
}
