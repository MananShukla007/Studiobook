/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        smu: {
          red: '#C8102E',
          'red-dark': '#a50e25',
          blue: '#0033A0',
          'blue-dark': '#002080',
        },
      },
    },
  },
  plugins: [],
}
