/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        point: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        line: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        error: {
          perceptual: '#f59e0b',
          tool: '#ef4444',
          abstraction: '#8b5cf6',
          transmission: '#06b6d4',
          cognitive: '#ec4899',
        },
      },
    },
  },
  plugins: [],
};
