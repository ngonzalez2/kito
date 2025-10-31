import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
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
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
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
