/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warm: {
          50: '#faf8f5',
          100: '#f5f0ea',
          200: '#ebe0d5',
          300: '#d6c5b3',
          400: '#bfa48c',
          500: '#a38368',
          600: '#876850',
          700: '#6c513e',
          800: '#553f31',
          900: '#463429',
        }
      }
    },
  },
  plugins: [],
}

