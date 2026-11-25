import React from 'react';
import { Sparkles } from 'lucide-react';

export function EmptyState({ icon: Icon = Sparkles, title, description, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/40">
      <div className="p-4 rounded-full bg-[#F0F4FA] dark:bg-slate-800 text-[#0FA3A3] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#0B1F3A] dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-[#0FA3A3] hover:bg-[#0D8B8B] text-white shadow-sm hover:shadow transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

