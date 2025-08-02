/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF6B35',
          black: '#2C3E50',
          white: '#FFFFFF'
        },
        accent: {
          blue: '#00D4FF',
          lime: '#E8FF00',
          purple: '#8A2BE2'
        },
        background: {
          dark: '#1A1A1A',
          darker: '#2D2D2D'
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'spark': 'spark 0.3s ease-out',
        'electric': 'electric 0.5s ease-in-out infinite alternate',
        'bounce-soft': 'bounce-soft 0.6s ease-in-out'
      },
      keyframes: {
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 5px #FF6B35, 0 0 10px #FF6B35, 0 0 15px #FF6B35',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 10px #FF6B35, 0 0 20px #FF6B35, 0 0 30px #FF6B35',
            transform: 'scale(1.05)'
          }
        },
        'spark': {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(0.8) rotate(360deg)' }
        },
        'electric': {
          '0%': { filter: 'brightness(1) hue-rotate(0deg)' },
          '100%': { filter: 'brightness(1.3) hue-rotate(30deg)' }
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
