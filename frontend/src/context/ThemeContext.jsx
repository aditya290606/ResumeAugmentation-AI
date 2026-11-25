import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const AVAILABLE_FONTS = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Modern Geometric (Recommended)', preview: 'Aa Bb Cc 123' },
  { id: 'Outfit', label: 'Outfit', category: 'Futuristic Clean Tech', preview: 'Aa Bb Cc 123' },
  { id: 'DM Sans', label: 'DM Sans', category: 'Minimalist Contemporary', preview: 'Aa Bb Cc 123' },
  { id: 'Inter', label: 'Inter', category: 'Classic Enterprise', preview: 'Aa Bb Cc 123' },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('resumeaugment_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  const [fontFamily, setFontFamily] = useState(() => {
    try {
      const saved = localStorage.getItem('resumeaugment_font');
      if (saved && AVAILABLE_FONTS.some(f => f.id === saved)) return saved;
      return 'Plus Jakarta Sans';
    } catch {
      return 'Plus Jakarta Sans';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('resumeaugment_theme', theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
  }, [theme]);

  useEffect(() => {
    const fontString = `'${fontFamily}', system-ui, -apple-system, sans-serif`;
    document.documentElement.style.fontFamily = fontString;
    document.body.style.fontFamily = fontString;
    try {
      localStorage.setItem('resumeaugment_font', fontFamily);
    } catch (e) {
      console.warn('Unable to persist font to localStorage', e);
    }
  }, [fontFamily]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isDark: theme === 'dark',
      fontFamily,
      setFontFamily,
      AVAILABLE_FONTS,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
