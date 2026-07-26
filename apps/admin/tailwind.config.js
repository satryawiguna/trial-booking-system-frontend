const sharedConfig = require("../../libs/shared/tailwind.config.base.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../libs/shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: sharedConfig.theme,
  plugins: [],
};
