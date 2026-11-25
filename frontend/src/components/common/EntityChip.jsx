import React from 'react';
import { getEntityStyle } from '../../data/entityTheme';

export function EntityChip({ label, count, active, onClick, size = 'sm' }) {
  const style = getEntityStyle(label);
  const isClickable = Boolean(onClick);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] space-x-1',
    sm: 'px-2.5 py-1 text-xs space-x-1.5',
    md: 'px-3 py-1.5 text-xs font-semibold space-x-2',
  }[size] || 'px-2.5 py-1 text-xs';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`inline-flex items-center rounded-md font-mono border font-medium transition-all ${style.light} ${style.dark} ${sizeClasses} ${
        isClickable ? 'cursor-pointer hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-teal-500' : 'cursor-default'
      } ${active ? 'ring-2 ring-[#0FA3A3] shadow-xs' : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.badge}`} />
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-black/10 dark:bg-white/10">
          {count}
        </span>
      )}
    </button>
  );
}

