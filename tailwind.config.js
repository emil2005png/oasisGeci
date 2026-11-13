/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './404.html', './js/**/*.js', './scripts/**/*.mjs'],
  theme: {
    extend: {
      colors: {
        brandNavy: '#0B3C5D',
        brandNavyDark: '#07263B',
        brandPrimary: '#30AFFF',
        brandWarm: '#D9532F',
        brandWarmHover: '#BF4422',
        pageBg: '#FAF8F5',
        cardBg: '#FFFFFF',
        textMain: '#132D46',
        textMuted: '#4B637A',
        borderSubtle: '#E5EBF0'
      },
      fontFamily: {
        heading: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      screens: {
        xs: '360px',
      }
    }
  },
  plugins: [],
};
