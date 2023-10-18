/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      textColor: {
        primary: '#040616',
      },
      backgroundColor: {
        primary: '#040616',
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
