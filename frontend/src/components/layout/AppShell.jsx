import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({
  activeTab,
  onTabChange,
  kpiStats,
  children,
}) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8 bg-[#FBFBFC] dark:bg-slate-950 transition-colors duration-200">
        {/* Top bar with clean title, compact live metrics, and controls */}
        <TopBar activeTab={activeTab} kpiStats={kpiStats} />

        {/* Tab-Specific Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
