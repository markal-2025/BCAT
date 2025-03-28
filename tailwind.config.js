/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        Blue: "#0B5887",
        Turquoise: "#0091AB",
        Red: "#DB4646",
        Beige: "#E7CF9F",
        Black: "#02121D",
        White: "#FDFBF7",
      },
      fontFamily: {
        Titles: "Helvetica Neue ",
        Subtitles: "Helvetica Neue ",
      },
    },
  },
  plugins: [],
};
