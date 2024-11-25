/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ubuntu', 'sans-serif'],
      },
      colors: {
        ubuntu: {
          orange: '#E95420',
          purple: '#772953',
          warmGrey: '#AEA79F',
          coolGrey: '#333333',
        },
      },
    },
  },
  plugins: [],
}
