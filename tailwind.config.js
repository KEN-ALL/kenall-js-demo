/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx', './public/index.html'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
