/**
 * Client-side file downloader for dataset exports.
 */
export function triggerFileDownload(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDatasetAsJsonl(variants) {
  const lines = variants.map(v => JSON.stringify({
    variant_id: v.variant_id || v.id,
    resume_id: v.resume_id,
    text: v.text,
    tokens: v.tokens || v.text.split(/\s+/),
    ents: v.ents || [],
    spans: v.spans || [],
    ops: v.ops || [],
    num_tokens: v.num_tokens || v.text.split(/\s+/).length,
  }));
  triggerFileDownload('augmented_dataset.jsonl', lines.join('\n'), 'application/x-jsonlines');
}

export function exportDatasetAsCsv(variants) {
  const headers = ['variant_id', 'resume_id', 'num_tokens', 'num_entities', 'operations_applied', 'preview_text'];
  const rows = variants.map(v => [
    `"${v.variant_id || v.id}"`,
    `"${v.resume_id || 'r001'}"`,
    v.num_tokens || v.text.split(/\s+/).length,
    v.num_entities || (v.spans ? v.spans.length : 0),
    `"${(v.ops || []).join('; ')}"`,
    `"${(v.text || '').slice(0, 100).replace(/"/g, '""')}..."`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerFileDownload('augmented_summary.csv', csvContent, 'text/csv');
}

export function exportDatasetAsSpacy(variants) {
  const spacyFormat = variants.map(v => ({
    text: v.text,
    entities: (v.spans || []).map(s => [s.start, s.end, s.label]),
  }));
  triggerFileDownload('spacy_annotations.json', JSON.stringify(spacyFormat, null, 2), 'application/json');
}

