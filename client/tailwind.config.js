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
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Refined Warm Gold Accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        eco: {
          50: '#f0fdf4',
          100: '#e6fcf0',
          200: '#c2f9dd',
          300: '#86f3ba',
          400: '#34d399', // Mint Green
          500: '#10b981', // Emerald/Mint Accent
          600: '#059669',
          700: '#047857',
          850: '#064e3b',
        },
        forest: {
          50: '#f4f9f7',
          100: '#e5f3ee',
          200: '#cce6dc',
          300: '#a3d1c0',
          400: '#72b59e',
          500: '#4f967d',
          600: '#3c7963',
          700: '#316250',
          800: '#284f42',
          900: '#1b342b',
          950: '#06120e', // Deep Forest Base
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94c0b1', // Tinted light green-slate
          500: '#64748b',
          600: '#475569',
          700: '#1b4537', // Custom deep green-slate
          800: '#123328', // Custom deep green-slate
          900: '#0b241c', // Custom deep green-slate
          950: '#06120e', // Custom deepest forest green
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
