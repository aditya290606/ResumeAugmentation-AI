import React, { useState } from 'react';
import { Settings, Moon, Sun, Server, CheckCircle2, XCircle, Type, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function SettingsView({
  apiBaseUrl,
  onApiBaseUrlChange,
  defaultVariantCount,
  onDefaultVariantCountChange,
  defaultSeed,
  onDefaultSeedChange,
  onNotify,
}) {
  const { isDark, toggleTheme, fontFamily, setFontFamily, AVAILABLE_FONTS } = useTheme();
  const [testingApi, setTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const testConnection = async () => {
    setTestingApi(true);
    setApiStatus(null);
    try {
      const res = await fetch(`${apiBaseUrl || ''}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setApiStatus({ success: true, message: `Connected to ${data.service || 'FastAPI Server'}` });
        onNotify?.('Successfully connected to Python FastAPI backend!', 'success');
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setApiStatus({ success: false, message: `Could not connect to ${apiBaseUrl || 'localhost:8000'}. Offline fallback active.` });
      onNotify?.('Backend server offline. Offline mock engine active.', 'warning');
    } finally {
      setTestingApi(false);
    }
  };

  const handleFontChange = (fontId) => {
    setFontFamily(fontId);
    onNotify?.(`Applied typography: ${fontId}`, 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Settings Sections */}
      <div className="space-y-4">
        {/* 1. Theme Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Interface Color Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Switch between clean light theme and high-contrast dark theme
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Typography & Font Family Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Interface Typography & Primary Typeface
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the primary font family for UI headers, body text, and document previews:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {AVAILABLE_FONTS.map((font) => {
              const isSelected = fontFamily === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleFontChange(font.id)}
                  style={{ fontFamily: font.id }}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{font.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">{font.category}</p>
                    </div>
                    {isSelected && (
                      <span className="p-0.5 rounded-full bg-indigo-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Pipeline Defaults */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors duration-200">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Pipeline Default Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="settingsVariantCount" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Default Variants per Resume
              </label>
              <input
                id="settingsVariantCount"
                type="number"
                min={1}
                max={50}
                value={defaultVariantCount}
                onChange={(e) => onDefaultVariantCountChange(parseInt(e.target.value, 10) || 8)}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Number of synthetic variations synthesized per base profile
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settingsDefaultSeed" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Default Random Seed
              </label>
              <input
                id="settingsDefaultSeed"
                type="number"
                value={defaultSeed}
                onChange={(e) => onDefaultSeedChange(parseInt(e.target.value, 10) || 42)}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Ensures exact deterministic reproducibility across experiments
              </p>
            </div>
          </div>
        </div>

        {/* 4. API Connection Configuration */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              FastAPI / Backend Connection
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              CORS / Proxy Ready
            </span>
          </div>

          <div className="space-y-2">
            <label htmlFor="settingsApiBaseUrl" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>API Base URL</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="settingsApiBaseUrl"
                type="text"
                value={apiBaseUrl}
                onChange={(e) => onApiBaseUrlChange(e.target.value)}
                placeholder="Leave blank for relative /api endpoint (http://127.0.0.1:8000)"
                className="flex-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                disabled={testingApi}
                onClick={testConnection}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {testingApi ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {apiStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-center space-x-2 border ${
                apiStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              {apiStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{apiStatus.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
