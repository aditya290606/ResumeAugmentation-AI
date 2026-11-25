import React, { useState } from 'react';
import {
  Sliders,
  Wand2,
  Layers,
  RefreshCw,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { ProbabilitySlider } from '../common/ProbabilitySlider';
import { VariantCard } from './VariantCard';
import { ComparisonModal } from './ComparisonModal';
import { EmptyState } from '../common/EmptyState';
import { ExportMenu } from '../common/ExportMenu';

export function AugmentationStudio({
  markup,
  parsedResume,
  variants,
  preservationCheck,
  isGenerating,
  progress,
  onRunAugmentation,
  onNotify,
}) {
  const [variantCount, setVariantCount] = useState(8);
  const [seed, setSeed] = useState(42);
  const [useNlpAug, setUseNlpAug] = useState(true);

  // Sliders state
  const [sliders, setSliders] = useState({
    verb_swap_p: 0.5,
    typo_word_p: 0.03,
    phone_p: 0.8,
    date_p: 0.8,
    header_rename_p: 0.6,
    header_style_p: 0.35,
    reorder_sections_p: 0.4,
    merge_skills_p: 0.3,
    contact_multiline_p: 0.4,
    company_suffix_p: 0.4,
    degree_p: 0.4,
  });

  const [selectedVariant, setSelectedVariant] = useState(null);

  const updateSlider = (key, val) => {
    setSliders((prev) => ({ ...prev, [key]: val }));
  };

  const handleGenerate = async () => {
    const res = await onRunAugmentation({
      markup,
      parsedResume,
      sliders,
      variantCount,
      seed,
      useNlpAug,
    });
    if (res?.success) {
      if (res.isMock) {
        onNotify?.(`Synthesized ${res.count} variants via offline engine`, 'info');
      } else {
        onNotify?.(`Synthesized ${res.count} variants via Python augmentation pipeline!`, 'success');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Transformation Probabilities
            </h3>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Number of variants input */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <label htmlFor="variantCountInput" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Variants:
              </label>
              <input
                id="variantCountInput"
                type="number"
                min={1}
                max={50}
                value={variantCount}
                onChange={(e) => setVariantCount(parseInt(e.target.value, 10) || 1)}
                className="w-12 text-center text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Seed input */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <label htmlFor="seedInput" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Seed:
              </label>
              <input
                id="seedInput"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
                className="w-16 text-center text-xs font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Variants'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar (Visible while generating) */}
        {isGenerating && (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Applying transformations without entity label drift...</span>
              </span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          <ProbabilitySlider
            label="Action Verb Swap"
            description="Replaces lead verbs with 60+ domain action verbs"
            value={sliders.verb_swap_p}
            onChange={(v) => updateSlider('verb_swap_p', v)}
            defaultValue={0.5}
          />
          <ProbabilitySlider
            label="Section Reordering"
            description="Permutes logical sections (experience, education, skills)"
            value={sliders.reorder_sections_p}
            onChange={(v) => updateSlider('reorder_sections_p', v)}
            defaultValue={0.4}
          />
          <ProbabilitySlider
            label="Header Vocabulary Rename"
            description="Substitutes section titles with 40+ synonym variants"
            value={sliders.header_rename_p}
            onChange={(v) => updateSlider('header_rename_p', v)}
            defaultValue={0.6}
          />
          <ProbabilitySlider
            label="Phone Format Variation"
            description="Dashes, dots, international codes (+1, +91, parens)"
            value={sliders.phone_p}
            onChange={(v) => updateSlider('phone_p', v)}
            defaultValue={0.8}
          />
          <ProbabilitySlider
            label="Date Range Variation"
            description="Month-Year, ISO dates, 'Present', and year spans"
            value={sliders.date_p}
            onChange={(v) => updateSlider('date_p', v)}
            defaultValue={0.8}
          />
          <ProbabilitySlider
            label="OCR Typo Perturbation"
            description="Simulates OCR confusion (l/1, O/0) and keyboard neighbor slips"
            value={sliders.typo_word_p}
            onChange={(v) => updateSlider('typo_word_p', v)}
            defaultValue={0.03}
          />
          <ProbabilitySlider
            label="Header Style Decoration"
            description="Uppercase, bracketed [EXPERIENCE], and dashed headers"
            value={sliders.header_style_p}
            onChange={(v) => updateSlider('header_style_p', v)}
            defaultValue={0.35}
          />
          <ProbabilitySlider
            label="Multi-Line Contact Layout"
            description="Single-line banner vs. multi-row contact block"
            value={sliders.contact_multiline_p}
            onChange={(v) => updateSlider('contact_multiline_p', v)}
            defaultValue={0.4}
          />
          <ProbabilitySlider
            label="Skills Inline Pipe Merging"
            description="Transforms bulleted skills to comma or pipe-delimited list"
            value={sliders.merge_skills_p}
            onChange={(v) => updateSlider('merge_skills_p', v)}
            defaultValue={0.3}
          />
        </div>
      </div>

      {/* Entity Preservation Verification Card (Shows Pass Rate & Checks) */}
      {preservationCheck && (
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
            preservationCheck.status === 'PASS'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                preservationCheck.status === 'PASS'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {preservationCheck.status === 'PASS' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider font-mono">
                {preservationCheck.status === 'PASS'
                  ? 'Entity Preservation Verification Passed (100%)'
                  : 'Entity Preservation Warning'}
              </p>
              <p className="text-xs text-slate-700 font-medium">
                <strong>{preservationCheck.passed_count} of {preservationCheck.total_variants}</strong> variants ({preservationCheck.pass_rate}%) preserved all {preservationCheck.expected_entities_per_variant || 'labeled'} entity spans with zero label drift.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                preservationCheck.status === 'PASS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {preservationCheck.status === 'PASS' ? '0 DROPPED LABELS' : `${preservationCheck.flagged_variants.length} FLAGGED`}
            </span>
          </div>
        </div>
      )}

      {/* Results Header & Gallery */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Generated Variant Gallery ({variants.length})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <ExportMenu
              variants={variants}
              onExportSuccess={(msg) => onNotify?.(msg, 'success')}
            />
          </div>
        </div>

        {/* Gallery Grid or Empty State */}
        {variants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((v, idx) => (
              <VariantCard
                key={v.variant_id || v.id || idx}
                variant={v}
                index={idx}
                onCompare={setSelectedVariant}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="No Variants Generated Yet"
            description="Configure the augmentation probabilities above and click 'Generate Variants' to synthesize training data."
            actionText="Generate 8 Sample Variants"
            onAction={handleGenerate}
          />
        )}
      </div>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={Boolean(selectedVariant)}
        onClose={() => setSelectedVariant(null)}
        originalResume={parsedResume}
        variant={selectedVariant}
      />
    </div>
  );
}
