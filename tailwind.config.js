import generated from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [generated],
};
