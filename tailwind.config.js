/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1020",
          blue: "#6366F1",
          purple: "#A855F7",
          green: "#22C55E",
        },
      },

      boxShadow: {
        glow: "0 0 40px rgba(99,102,241,0.35)",
        card: "0 10px 30px rgba(0,0,0,0.08)",
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },

  plugins: [],
}