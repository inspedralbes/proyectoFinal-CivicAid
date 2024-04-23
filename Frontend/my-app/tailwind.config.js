

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/*.{js,jsx,ts,tsx}",
    "./src/pages/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}", "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        // 'image-all': "url('/public/retroNeo.jpg')",
        // 'image-arcade': "url('/public/Arcade.jpg')",
        },
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
    },
  },
  // plugins: [require("flowbite/plugin")],
  plugins: [],
  darkMode: 'class',
}

