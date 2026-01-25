/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mystery: {
          paper: '#e3dac9',
          ink: '#1a1a1a',
          blood: '#8a0303',
          dark: '#0f0f0f',
          charcoal: '#2c2c2c',
          aged: '#c0b298',
          sepia: '#704214',
        },
      },
      animation: {
        'flicker': 'flicker 2s infinite',
        'fade-in': 'fadeIn 1s ease-out',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: 0.99 },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: 0.4 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      fontFamily: {
        typewriter: ['Special Elite', 'Courier New', 'monospace'],
        handwriting: ['Caveat', 'Patrick Hand', 'cursive'],
        body: ['Courier Prime', 'monospace'],
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/aged-paper.png')",
        'grunge-texture': "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://www.transparenttextures.com/patterns/concrete-wall.png')",
      }
    },
  },
  plugins: [],
}