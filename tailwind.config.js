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
          blue: "#D946EF",   // alias → magenta, kept so existing brand-blue classes update automatically
          purple: "#7C3AED", // now violet
          pink: "#FF3B82",
          magenta: "#D946EF",
          violet: "#7C3AED",
          green: "#22C55E",  // kept as real green — semantic success color, not part of the new gradient
        },
      },

      boxShadow: {
        glow: "0 0 40px rgba(217,70,239,0.35)",
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