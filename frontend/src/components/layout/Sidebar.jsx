import React from 'react';
import {
  FileEdit,
  Sliders,
  BarChart3,
  Award,
  Settings,
  Layers,
} from 'lucide-react';

export function Sidebar({ activeTab, onTabChange }) {
  const navItems = [
    {
      id: 'editor',
      label: 'Annotate & Linter',
      icon: FileEdit,
      color: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold',
    },
    {
      id: 'studio',
      label: 'Augmentation Studio',
      icon: Sliders,
      color: 'text-violet-600 dark:text-violet-400',
      activeBg: 'bg-violet-50/80 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold',
    },
    {
      id: 'analytics',
      label: 'Dataset Analytics',
      icon: BarChart3,
      color: 'text-sky-600 dark:text-sky-400',
      activeBg: 'bg-sky-50/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold',
    },
    {
      id: 'evaluation',
      label: 'Model Benchmark',
      icon: Award,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-slate-600 dark:text-slate-400',
      activeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen transition-colors duration-200">
        {/* Clean Minimal Brand Header */}
        <div className="h-14 px-5 flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">ResumeAugment</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">AI</span>
          </div>
        </div>

        {/* Clean Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isActive
                    ? `${item.activeBg}`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Minimal Subtle Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>v2.0 · Localhost</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
