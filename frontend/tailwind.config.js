/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#f8fafc",
        navy: "#0f172a",
        accent: "#3b82f6",
        secondary: "#1d4ed8",
        rim: "#e5e7eb",
        highlight: "#eff6ff",
      },
      boxShadow: {
        card: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
}