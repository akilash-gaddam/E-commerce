/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // STANDARD.IO Design System
        canvas: '#F7F6F2',
        elevated: '#FFFFFF',
        ink: '#111111',
        'ink-muted': '#52524E',
        'ink-light': '#A8A7A1',
        citrus: '#D4FF00',
        'citrus-hover': '#C4EB00',
        'citrus-text': '#111111',
        forest: '#143628',
        'forest-hover': '#0F2A1F',
        'forest-text': '#F7F6F2',
        border: '#111111',
        'border-muted': '#E7E5E0',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        display: '700',
        'display-bold': '800',
        'body-normal': '400',
        'body-medium': '500',
        'body-semibold': '600',
        'body-bold': '700',
        'mono-medium': '500',
        'mono-bold': '700',
      },
      boxShadow: {
        'hard': '4px 4px 0px #111111',
        'hard-sm': '2px 2px 0px #111111',
        'hard-lg': '6px 6px 0px #111111',
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
}