/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1fb',
          100: '#b5d4f4',
          500: '#378add',
          600: '#185fa5',
          700: '#0c447c',
          900: '#042c53'
        },
        sanovita: {
          vert: '#1D9E75',
          bleu: '#185fa5',
          rouge: '#E24B4A'
        }
      }
    },
  },
  plugins: [],
}