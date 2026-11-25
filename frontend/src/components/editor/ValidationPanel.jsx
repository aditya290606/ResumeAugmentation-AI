import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Lightbulb } from 'lucide-react';

export function ValidationPanel({ validationResult }) {
  const { isValid, errors = [], warnings = [], totalEntities = 0, totalSections = 0 } = validationResult || {};

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          {isValid ? (
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Markup Linter & Schema Validator
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
            isValid
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {isValid ? 'SYNTAX 100% VALID' : `${errors.length} SYNTAX ERROR${errors.length > 1 ? 'S' : ''}`}
        </span>
      </div>

      {/* KPI Counters with High WCAG Contrast */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Sections Detected</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{totalSections}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Entities Labeled</span>
          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">{totalEntities}</span>
        </div>
      </div>

      {/* Errors with Line Number, Plain Explanation, and Suggestion */}
      {errors.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Blocking Syntax Errors ({errors.length})</span>
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {errors.map((err, i) => (
              <div
                key={i}
                className="text-xs bg-rose-50/90 text-rose-950 p-3 rounded-xl border border-rose-200 space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-600 text-white shrink-0">
                    Line {err.line || 1}
                  </span>
                  <span className="font-semibold text-rose-900">{err.message}</span>
                </div>
                {err.suggestion && (
                  <div className="flex items-start space-x-1.5 text-[11px] text-rose-800 bg-white/70 p-2 rounded-lg border border-rose-200/60 font-medium">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Fix Suggestion:</strong> {err.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings with Line Number, Plain Explanation, and Suggestion */}
      {warnings.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Schema Warnings ({warnings.length})</span>
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {warnings.map((warn, i) => (
              <div
                key={i}
                className="text-xs bg-amber-50 text-amber-950 p-3 rounded-xl border border-amber-200 space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500 text-white shrink-0">
                    Line {warn.line || 1}
                  </span>
                  <span className="font-semibold text-amber-900">{warn.message}</span>
                </div>
                {warn.suggestion && (
                  <div className="flex items-start space-x-1.5 text-[11px] text-amber-800 bg-white/70 p-2 rounded-lg border border-amber-200/60 font-medium">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Recommendation:</strong> {warn.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {isValid && warnings.length === 0 && (
        <div className="flex items-center space-x-2.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All tags matched and validated against standard HR schema tokens. Ready for augmentation.</span>
        </div>
      )}
    </div>
  );
}
