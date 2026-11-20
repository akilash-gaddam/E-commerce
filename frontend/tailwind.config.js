/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Dark Mode Palette
        canvas: '#09090B',           // Deep Obsidian Matte
        elevated: '#111114',           // Smoked Charcoal (cards, modals, drawers)
        ink: '#F4F4F6',              // Crisp Alabaster (primary text)
        'ink-muted': '#9A9AA2',       // Warm Silver (secondary text)
        'ink-light': '#63636B',       // Pewter (metadata)

        // Luxury Champagne Gold Accent (replaces citrus)
        gold: '#D4AF37',
        'gold-hover': '#E6C768',
        'gold-text': '#09090B',      // Dark text on gold buttons

        // Status Colors
        emerald: '#10B981',          // Deep Emerald (in stock, delivered, profit)
        amber: '#F59E0B',            // Amber (low stock)
        crimson: '#EF4444',          // Crimson (out of stock, delete)

        // Borders & Dividers
        border: 'rgba(255, 255, 255, 0.08)',
        'border-active': 'rgba(212, 175, 55, 0.45)',
        'border-muted': 'rgba(255, 255, 255, 0.04)',

        // Glassmorphism
        'glass': 'rgba(17, 17, 20, 0.90)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],    // Editorial luxury serif
        body: ['Plus Jakarta Sans', 'sans-serif'],    // Clean geometric
        mono: ['JetBrains Mono', 'monospace'],        // Tabular numerals
      },
      fontWeight: {
        display: '600',
        'display-bold': '700',
        'body-normal': '400',
        'body-medium': '500',
        'body-semibold': '600',
        'body-bold': '700',
        'mono-medium': '500',
        'mono-bold': '700',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'hard': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'hard-sm': '0 8px 16px -4px rgba(0, 0, 0, 0.5)',
        'hard-lg': '0 32px 64px -20px rgba(0, 0, 0, 0.8)',
        'soft': '0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      backdropBlur: {
        'md': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}