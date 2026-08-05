/** @type {import('tailwindcss').Config} */

// Loaded by Tailwind v4 through the `@config` line in src/index.css.
//
// COLOURS AND FONTS ARE NOT DEFINED HERE. They live in the `@theme` block of
// src/index.css, because @theme emits real CSS custom properties that App.css
// and inline styles can read — config values only ever become utilities.
// See DESIGN_LANGUAGE.md §8.
//
// What remains here is the keyframe/animation registry, which @theme cannot
// express.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'enter-up': 'erEnterUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'flicker': 'flicker 4s infinite',
      },
      keyframes: {
        // Never fade on opacity alone — always paired with a transform (§7).
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        erEnterUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: 0.99 },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: 0.62 },
        },
      },
    },
  },
  plugins: [],
}
