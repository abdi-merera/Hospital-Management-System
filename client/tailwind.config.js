/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'hmis-green': '#31b372',
        'hmis-green-dark': '#155734',
        'hmis-page': '#efececa7',
        'hmis-panel': '#ebe8e8',
        'hmis-soft-green': '#f6fff9',
        'hmis-muted-header': '#E0E0E0',
      },
      fontFamily: {
        proxima: ['Proxima Nova', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
