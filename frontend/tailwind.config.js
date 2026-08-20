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
        clinical: {
          bg: '#F7F9FC',
          surface: '#FFFFFF',
          secondary: '#F9FBFD',
          hover: '#F1F7FA',
          border: '#EAECF0',
          'border-hover': '#D0D5DD',
        },
        cyan: {
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          soft: '#ECFEFF',
        },
        violet: {
          500: '#8B5CF6',
          600: '#7C3AED',
          soft: '#F5F3FF',
        },
        priority: {
          high: '#DC2626',
          medium: '#D97706',
          low: '#059669',
          'high-bg': '#FEF2F2',
          'medium-bg': '#FFFBEB',
          'low-bg': '#ECFDF3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
