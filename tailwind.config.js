/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#108C50",
          light: "#3AD48A",
          muted: "#EAF5F0",
          dark: "#0C693C",
        },
      },
    },
  },
  plugins: [],
};
