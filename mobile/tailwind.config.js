/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0d9488", // Teal 600
        secondary: "#4f46e5", // Indigo 600
        accent: "#f43f5e", // Rose 500
        dark: "#0f172a" // Slate 900
      }
    },
  },
  plugins: [],
}
