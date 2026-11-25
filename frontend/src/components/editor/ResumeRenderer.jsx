import React, { useState } from 'react';
import { EntityHighlight } from '../common/EntityHighlight';
import { Tag } from 'lucide-react';

export function ResumeRenderer({ sections = [] }) {
  const [showTags, setShowTags] = useState(false);

  if (!sections || sections.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        No parsed sections to display. Enter or paste resume markup on the left.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 md:p-8 space-y-6 text-slate-900 dark:text-slate-100 font-sans border border-slate-200 dark:border-slate-800 shadow-xs relative transition-colors duration-200">
      {/* Subtle Tag Toggle Pill in top right */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowTags(!showTags)}
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            showTags
              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
          title="Toggle inline entity label pills"
        >
          <Tag className="w-3 h-3" />
          <span>{showTags ? 'Labels Visible' : 'Show Labels'}</span>
        </button>
      </div>

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-2">
          {section.title && (
            <div className="border-b border-slate-200 dark:border-slate-800 pb-1">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200 font-mono">
                {section.title}
              </h3>
            </div>
          )}

          <div className="space-y-1.5 text-xs leading-relaxed">
            {section.items.map((item, iIdx) => (
              <div
                key={iIdx}
                className={`flex items-start ${item.bullet ? 'pl-2' : ''}`}
              >
                {item.bullet && (
                  <span className="text-slate-400 dark:text-slate-600 font-bold mr-2 select-none">•</span>
                )}
                <div className="flex-1 flex-wrap text-slate-800 dark:text-slate-200">
                  {(item.segments || []).map((seg, segIdx) => {
                    if (seg.label) {
                      return (
                        <EntityHighlight
                          key={segIdx}
                          label={seg.label}
                          text={seg.text}
                          showTag={showTags}
                        />
                      );
                    }
                    return (
                      <span key={segIdx} className="text-slate-800 dark:text-slate-300 font-normal">
                        {seg.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
