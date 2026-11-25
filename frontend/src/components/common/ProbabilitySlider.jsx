import React from 'react';
import { RotateCcw } from 'lucide-react';

export function ProbabilitySlider({
  label,
  value,
  onChange,
  description,
  min = 0,
  max = 1,
  step = 0.05,
  defaultValue = 0.5,
}) {
  const percentage = Math.round(value * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs transition-all">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800">
            {percentage}%
          </span>
          {defaultValue !== undefined && value !== defaultValue && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              title="Reset to default"
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 leading-normal">
          {description}
        </p>
      )}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40"
      />
    </div>
  );
}
