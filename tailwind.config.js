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
      width: {
        '18px': '18px'
      },
      maxWidth: {
        '420px': '420px'
      },
      maxHeight: {
        '3/4': '75%'
      },
      height: {
        '18px': '18px',
        '64px': '64px'
      },
      colors: {
        'ocean-blue': 'rgba(94,118,153, 0.15)',
        'light-gray': '#F3F6FD',
        'pinky-white': '#F7F8FF',
        'blue-main': "#4355F9",
        'light-blue': 'rgba(67, 85, 249, 0.35)',
        'grey': '#8B88AA'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
