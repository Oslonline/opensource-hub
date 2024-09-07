/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-radial-gradient': 'radial-gradient(circle, rgba(244, 244, 245, 0.4) 0%, rgba(39, 39, 42, 1) 100%)',
      },
    },
  },
  plugins: [],
};
