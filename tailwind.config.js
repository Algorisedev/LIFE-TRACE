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
          dark: "#0a0a0f",
          card: "#12131c",
          border: "#212436",
          spotify: "#1db954",
          household: "#3b82f6",
          transactions: "#f59e0b",
          danger: "#ef4444",
        }
      }
    },
  },
  plugins: [],
}
