module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      'xs': {
        min: '0px',
        max: '639px'
      },
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '1024px',
      // => @media (min-width: 1024px) { ... }

      'lg': '1280px',
      // => @media (min-width: 1280px) { ... }
    },
    extend: {
      maxWidth: {
        '420px': '420px'
      },
      maxHeight: {
        '3/4': '75%'
      },
      colors: {
        'ocean-blue': 'rgba(94,118,153, 0.15)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
