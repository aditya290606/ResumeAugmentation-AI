import React from 'react';
import { Sun, Moon, Type } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function TopBar({ activeTab, kpiStats }) {
  const { isDark, toggleTheme, fontFamily, setFontFamily, AVAILABLE_FONTS } = useTheme();

  const tabLabels = {
    editor: 'Resume Annotator & Linter',
    studio: 'Augmentation Studio',
    analytics: 'Dataset Analytics',
    evaluation: 'Model Benchmark',
    settings: 'Settings',
  };

  const { baseResumes = 10, augmentedExamples = 160, avgVariantsPerResume = 16 } = kpiStats || {};

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Current Section Title */}
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
          {tabLabels[activeTab] || 'Dashboard'}
        </h2>
      </div>

      {/* Right Tools: Compact Live KPIs, Font Selector, Theme Toggle */}
      <div className="flex items-center space-x-3">
        {/* Compact Live KPI Badges */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono font-medium">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" title="Base resume archetypes">
            <strong className="text-slate-900 dark:text-white font-bold">{baseResumes}</strong> Base
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60" title="Total synthesized dataset examples">
            <strong className="text-indigo-900 dark:text-indigo-200 font-bold">{augmentedExamples}</strong> Augmented
          </span>
          <span className="px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/60" title="Average variants generated per resume">
            <strong className="text-violet-900 dark:text-violet-200 font-bold">{avgVariantsPerResume}x</strong> Ratio
          </span>
        </div>

        {/* Font Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Type className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="text-xs bg-transparent border-0 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            title="Switch primary typeface"
          >
            {AVAILABLE_FONTS.map((f) => (
              <option key={f.id} value={f.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden cursor-pointer"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
}
