/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:      '#fafcff',
        navy:      '#0F2854',
        secondary: '#1C4D8D',
        accent:    '#4988C4',
        highlight: '#BDE8F5',
        rim:       '#e2edf8',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,40,84,0.06), 0 1px 2px -1px rgba(15,40,84,0.04)',
        md:   '0 4px 12px 0 rgba(15,40,84,0.08)',
      },
    },
  },
  plugins: [],
}
