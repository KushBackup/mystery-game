/** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            halloween: {
              orange: '#FF6B35',
              purple: '#7209B7',
              dark: '#2B2D42',
              green: '#4CAF50',
              yellow: '#FFD23F',
              pink: '#F72585',
            },
          },
          animation: {
            'shake': 'shake 0.5s ease-in-out',
            'bounce-slow': 'bounce 2s infinite',
            'wiggle': 'wiggle 1s ease-in-out infinite',
            'float': 'float 3s ease-in-out infinite',
            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
          keyframes: {
            wiggle: {
              '0%, 100%': { transform: 'rotate(-3deg)' },
              '50%': { transform: 'rotate(3deg)' },
            },
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          },
          fontFamily: {
            casual: ['Comic Sans MS', 'Chalkboard SE', 'Comic Neue', 'cursive'],
            spooky: ['Creepster', 'Nosifer', 'Eater', 'cursive'],
          },
        },
      },
      plugins: [],
    }