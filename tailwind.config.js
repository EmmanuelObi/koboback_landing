/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#85BB65",
          light: "#90EE90",
          muted: "#EAF6E4",
          dark: "#6FA048",
        },
      },
    },
  },
  plugins: [],
};
