/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F5',
        ink: '#221F1E',
        plum: {
          50: '#F7EEF2',
          100: '#F1E4EA',
          300: '#C99BAE',
          500: '#8A5068',
          600: '#7A4560',
          700: '#5F3550',
        },
        gold: {
          400: '#D8B978',
          500: '#C79A4B',
          600: '#A87E38',
        },
        sage: {
          500: '#5B7A5B',
          600: '#496249',
        },
        clay: {
          500: '#B0483F',
          600: '#963B33',
        },
      },
      fontFamily: {
        display: ['"Shippori Mincho"', 'serif'],
        body: ['"Zen Kaku Gothic New"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
