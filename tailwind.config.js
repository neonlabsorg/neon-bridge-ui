module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: {
        min: '0px',
        max: '639px'
      },
      sm: '640px',
      md: '1024px',
      lg: '1280px'
    },
    extend: {
      width: {
        '18px': '18px'
      },
      fontSize: {
        headline: ['20px', '24px'],
        'base-2': ['18px', '24px'],
      },
      letterSpacing: {
        tight: '-0.01em',
        tighten: '-0.6px'
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
        'blue-main': '#4355F9',
        'grey': '#8B88AA',
        'light-blue': 'rgba(67, 85, 249, 0.35)',
        'black': '#151515',
        'snowy': 'rgba(216, 236, 255, 0.72)',
        'light-100': '#E2E6EA',
        'dark-600': '#242424',
        'dark-500': '#303030',
        'dark-300': '#616163',
        'dark-200': '#5B5B5B',
        'op04-white': 'rgba(255, 255, 255, 0.04)',
        'op15-white': 'rgba(255, 255, 255, 0.15)',
        'op15-black': 'rgba(0, 0, 0, 0.15)',
        'main-bg-color': '#06010D',
        'light-grey': '#91879E',
        'input-bg': '#282230',
        'input-bg-hover': '#37313F',
        'input-hint-text': '#3F3A46',
        'input-bg-disabled': '#1C1920',
        'input-text-disabled': '#91879E',
        'dropdown-item-hovered': '#4B4455',
        'dropdown-item-text-hovered': '#EF6B4C',
        'text-purple': '#9F65FF',
        'border-color': 'rgba(255, 255, 255, 0.3)',
        'link-hover-color': '#F5FF6B',
      }
    },
    fill: {
      white: '#fff',
      black: '#151515'
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
