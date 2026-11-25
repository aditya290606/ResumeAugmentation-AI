/**
 * Unified Entity Theme Definitions for ResumeAugment AI.
 * Strict color mappings:
 * NAME: indigo, EMAIL: sky, PHONE: emerald, LOCATION: rose,
 * DESIGNATION: violet, COMPANY: orange, COLLEGE: cyan,
 * DEGREE: fuchsia, SKILL: lime, DATE: amber.
 */

export const ENTITY_THEME = {
  NAME: {
    label: 'NAME',
    description: 'Candidate Full Name',
    light: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    dark: 'dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/80',
    highlight: 'bg-indigo-100/90 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-700',
    badge: 'bg-indigo-500',
    chartColor: '#6366F1',
    hex: '#6366F1',
  },
  EMAIL: {
    label: 'EMAIL',
    description: 'Email Address',
    light: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    dark: 'dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-900/80',
    highlight: 'bg-sky-100/90 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700',
    badge: 'bg-sky-500',
    chartColor: '#0EA5E9',
    hex: '#0EA5E9',
  },
  PHONE: {
    label: 'PHONE',
    description: 'Telephone / Mobile Number',
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    dark: 'dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/80',
    highlight: 'bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700',
    badge: 'bg-emerald-500',
    chartColor: '#10B981',
    hex: '#10B981',
  },
  LOCATION: {
    label: 'LOCATION',
    description: 'City, State, Country',
    light: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    dark: 'dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900/80',
    highlight: 'bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700',
    badge: 'bg-rose-500',
    chartColor: '#F43F5E',
    hex: '#F43F5E',
  },
  DESIGNATION: {
    label: 'DESIGNATION',
    description: 'Job Title / Professional Role',
    light: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    dark: 'dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900/80',
    highlight: 'bg-violet-100/90 text-violet-900 border-violet-300 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-700',
    badge: 'bg-violet-500',
    chartColor: '#8B5CF6',
    hex: '#8B5CF6',
  },
  COMPANY: {
    label: 'COMPANY',
    description: 'Employer / Organization',
    light: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    dark: 'dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/80',
    highlight: 'bg-orange-100/90 text-orange-900 border-orange-300 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700',
    badge: 'bg-orange-500',
    chartColor: '#F97316',
    hex: '#F97316',
  },
  COLLEGE: {
    label: 'COLLEGE',
    description: 'University / Institute',
    light: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    dark: 'dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-900/80',
    highlight: 'bg-cyan-100/90 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-200 dark:border-cyan-700',
    badge: 'bg-cyan-500',
    chartColor: '#06B6D4',
    hex: '#06B6D4',
  },
  DEGREE: {
    label: 'DEGREE',
    description: 'Degree / Qualification',
    light: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100',
    dark: 'dark:bg-fuchsia-950/70 dark:text-fuchsia-300 dark:border-fuchsia-800 dark:hover:bg-fuchsia-900/80',
    highlight: 'bg-fuchsia-100/90 text-fuchsia-900 border-fuchsia-300 dark:bg-fuchsia-950/80 dark:text-fuchsia-200 dark:border-fuchsia-700',
    badge: 'bg-fuchsia-500',
    chartColor: '#D946EF',
    hex: '#D946EF',
  },
  SKILL: {
    label: 'SKILL',
    description: 'Technical Competency / Tool',
    light: 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100',
    dark: 'dark:bg-lime-950/70 dark:text-lime-300 dark:border-lime-800 dark:hover:bg-lime-900/80',
    highlight: 'bg-lime-100/90 text-lime-900 border-lime-400 dark:bg-lime-950/80 dark:text-lime-200 dark:border-lime-700',
    badge: 'bg-lime-500',
    chartColor: '#84CC16',
    hex: '#84CC16',
  },
  DATE: {
    label: 'DATE',
    description: 'Dates / Employment Timeline',
    light: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    dark: 'dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/80',
    highlight: 'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700',
    badge: 'bg-amber-500',
    chartColor: '#F5A524',
    hex: '#F5A524',
  },
  LINK: {
    label: 'LINK',
    description: 'URL / Profile Link',
    light: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    dark: 'dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-900/80',
    highlight: 'bg-teal-100/90 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-700',
    badge: 'bg-teal-500',
    chartColor: '#14B8A6',
    hex: '#14B8A6',
  },
  CERTIFICATION: {
    label: 'CERTIFICATION',
    description: 'Credential / License',
    light: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    dark: 'dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/80',
    highlight: 'bg-blue-100/90 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700',
    badge: 'bg-blue-500',
    chartColor: '#3B82F6',
    hex: '#3B82F6',
  },
};

export const VALID_ENTITY_KEYS = Object.keys(ENTITY_THEME);

export const VALID_SECTION_KEYS = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'awards',
  'publications',
];

export function getEntityStyle(label) {
  const normalized = (label || '').toUpperCase();
  return (
    ENTITY_THEME[normalized] || {
      label: normalized,
      description: 'Custom Entity',
      light: 'bg-slate-100 text-slate-700 border-slate-200',
      dark: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      highlight: 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
      badge: 'bg-slate-500',
      chartColor: '#94A3B8',
      hex: '#94A3B8',
    }
  );
}

