import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Eye, Copy, Check } from 'lucide-react';

export function DataTable({ variants = [], onInspect, onNotify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('variant_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const filteredAndSorted = useMemo(() => {
    let list = variants.filter((v) => {
      const q = searchTerm.toLowerCase();
      const id = (v.variant_id || v.id || '').toLowerCase();
      const ops = (v.ops || []).join(' ').toLowerCase();
      const text = (v.text || '').toLowerCase();
      return id.includes(q) || ops.includes(q) || text.includes(q);
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'variant_id') {
        valA = a.variant_id || a.id || '';
        valB = b.variant_id || b.id || '';
      } else if (sortField === 'num_tokens') {
        valA = a.num_tokens || (a.text ? a.text.split(/\s+/).length : 0);
        valB = b.num_tokens || (b.text ? b.text.split(/\s+/).length : 0);
      } else if (sortField === 'num_entities') {
        valA = a.num_entities || (a.spans ? a.spans.length : 0);
        valB = b.num_entities || (b.spans ? b.spans.length : 0);
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [variants, searchTerm, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const copyVariant = (v) => {
    navigator.clipboard.writeText(v.text);
    setCopiedId(v.variant_id || v.id);
    onNotify?.(`Copied ${v.variant_id || v.id}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0E172C] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
      {/* Table search bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variants by ID, operation, or text..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0FA3A3]"
          />
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {filteredAndSorted.length} of {variants.length} examples
        </span>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('variant_id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Variant ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Applied Transformations</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('num_tokens')}
              >
                <div className="flex items-center space-x-1">
                  <span>Tokens</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => handleSort('num_entities')}
              >
                <div className="flex items-center space-x-1">
                  <span>Entities</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((v, i) => {
                const vid = v.variant_id || v.id || `var_${i + 1}`;
                const ops = v.ops || [];
                const tok = v.num_tokens || (v.text ? v.text.split(/\s+/).length : 0);
                const ent = v.num_entities || (v.spans ? v.spans.length : 0);

                return (
                  <tr
                    key={vid}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#0B1F3A] dark:text-slate-200">
                      {vid}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {ops.slice(0, 4).map((op, opIdx) => (
                          <span
                            key={opIdx}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {op.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {ops.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{ops.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{tok}</td>
                    <td className="py-3 px-4 font-bold text-[#0FA3A3]">{ent}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => copyVariant(v)}
                          title="Copy raw text"
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {copiedId === vid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onInspect?.(v)}
                          title="Inspect in comparison modal"
                          className="px-2 py-1 text-[11px] font-sans font-semibold rounded bg-teal-50 dark:bg-teal-950/60 text-[#0FA3A3] hover:bg-[#0FA3A3] hover:text-white transition-colors"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                  No matching variants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

