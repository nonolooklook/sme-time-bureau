/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      borderColor: {
        primary: '#FFAC03',
      },
      backgroundColor: {
        primary: '#FFAC03',
      },
      textColor: {
        primary: '#FFAC03',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen xl': {
            maxWidth: '1100px',
          },
        },
      })
    },
  ],
}
