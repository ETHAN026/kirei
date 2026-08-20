/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: '#000000',
        coal: '#0E0E0E',
        surface: '#161616',
        raised: '#1E1E1E',
        line: '#262626',
        cream: '#F4F2EE',
        paper: '#F6F4F0',
        gold: {
          100: '#FFFFFF',
          200: '#FAFAF8',
          300: '#F0EEE9',
          400: '#E6E3DC',
          500: '#D9D6CE',
          600: '#B4B0A7',
          700: '#8A867D',
        },
        sage: {
          500: '#3E8E5A',
          600: '#2F7046',
        },
        clay: {
          500: '#C63B35',
          600: '#A32F2A',
        },
        barber: {
          red: '#C63B35',
          blue: '#2F54C4',
          white: '#F4F2EE',
        },
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wide2: '0.2em',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.15) translateY(-2%)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        kenburns: 'kenburns 18s ease-in-out infinite alternate',
        'spin-slow': 'spin-slow 22s linear infinite',
      },
    },
  },
  plugins: [],
}
