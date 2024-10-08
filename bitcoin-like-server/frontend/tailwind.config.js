/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
          fontFamily: {
            comic: ['"Comic Sans MS"', 'cursive']
          },
          boxShadow: {
            'comic': '4px 4px 0px 0px rgba(0,0,0,0.7)',
          },
          textShadow: {
            comic: '2px 2px 0px rgba(0, 0, 0, 0.7)',
          },
          borderWidth: {
            'comic': '4px',
          }
        },
      },
      variants: {},
      plugins: [
        require('tailwindcss-textshadow'),
      ],
}
