import React from 'react';
import { getEntityStyle } from '../../data/entityTheme';

export function EntityHighlight({ label, text, showTag = false }) {
  const style = getEntityStyle(label);

  return (
    <span
      className={`inline-flex items-baseline px-1.5 py-0.5 rounded border mx-0.5 my-0.5 transition-all text-xs font-medium cursor-help ${style.highlight}`}
      title={`${label}: ${style.description}`}
    >
      <span className="font-sans font-semibold text-slate-900 dark:text-slate-100">{text}</span>
      {showTag && (
        <span className="ml-1 text-[9px] uppercase tracking-wider opacity-85 font-mono select-none px-1 rounded bg-black/5 dark:bg-white/15 font-bold">
          {label}
        </span>
      )}
    </span>
  );
}
