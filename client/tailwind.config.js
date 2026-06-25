/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where your files are
  // So it only includes CSS classes you actually use
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom red color for blood donor theme
      colors: {
        primary: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        }
      }
    },
  },
  plugins: [],
}

