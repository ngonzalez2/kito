const forms = require('@tailwindcss/forms');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './context/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: 'var(--sand)',
        aqua: 'var(--aqua)',
        'deep-blue': 'var(--deep-blue)',
        coral: 'var(--coral)',
        sky: 'var(--sky)',
        white: 'var(--white)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        coral: '0 20px 40px rgba(242, 106, 75, 0.35)',
      },
      backgroundImage: {
        'coastal-gradient': 'linear-gradient(135deg, var(--sky) 0%, var(--aqua) 100%)',
      },
    },
  },
  plugins: [forms],
};
