/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          50: '#F0F4FA',
          100: '#D9E3F1',
          200: '#B0C5E2',
          300: '#7FA2D0',
          400: '#4C7CB9',
          500: '#2A5A9B',
          600: '#1B4075',
          700: '#122D55',
          800: '#0B1F3A',
          900: '#061224',
          950: '#030A14',
        },
        teal: {
          accent: '#0FA3A3',
          hover: '#0D8B8B',
          subtle: '#E6F6F6',
          dark: '#086363',
        },
        offwhite: '#F7F8FA',
        amber: {
          accent: '#F5A524',
          subtle: '#FEF6E9',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0B132B',
          cardDark: '#111C38',
          borderDark: '#1E2D4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 31, 58, 0.05), 0 2px 6px -1px rgba(11, 31, 58, 0.02)',
        'soft-lg': '0 10px 30px -4px rgba(11, 31, 58, 0.08), 0 4px 12px -2px rgba(11, 31, 58, 0.03)',
        'dark-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}

