/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        comic: ['Comic Neue', 'cursive'],
      },
    },
  },
  plugins: [],
};