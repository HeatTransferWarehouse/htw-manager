/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: '#a759d1',
        primaryLight: '#ca9be3',
        secondary: '#6240D0',
        secondaryLight: '#7a5dd7',
        dark: '#1d1d1d',
        darkBg: 'white',
        neutral: '#666666',
        secondaryHover: '#eeecf9',
      },
      backgroundColor: {
        grad: 'linear-gradient(90deg, #a759d1 0%, #6240D0 29%, #ff1362, 67%, #fc4242 80%, #a759d1 100%)',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      gridTemplateColumns: {
        queue: '4rem 3fr 4fr 6fr 2fr 2fr 2fr 4rem',
        queueMobile: '3rem 1fr 3rem',
        clothing: '3rem 3fr 3fr 8fr 4fr 2fr 2fr 3fr 3rem 1px',
        orders: '4rem 3fr 3fr 2fr 4fr 6fr 7fr 6fr 5fr 1fr 3fr 3fr 4fr',
        adminUserTable: '8fr 3fr 3fr 4rem 4rem',
        supacolor: '3rem 2fr 2fr 2fr 1.5fr 1.5fr 9rem',
        promos: '5rem 4fr 1.5fr 1.5fr 1.5fr 7rem',
        sff: '3rem 3fr 3fr 8fr 4fr 2fr 2fr 3fr 3rem',
        productsList: '2fr 4fr 1fr',
        productsListImages: '2fr 4fr 2fr 1fr',
        productsListMobile: '3rem 1fr 3rem',
      },
      boxShadow: {
        default: '0 1px 2px 0 rgba(0, 0, 0, .5);',
        defaultDark: '0 1px 2px 0 rgba(255, 255, 255, .5);',
        defaultInverse: '0px -1px 2px 0px rgba(0,0,0,0.25);',
      },
      width: {
        fit: 'fit-content',
      },
      keyframes: {
        hide: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        slideIn: {
          from: {
            transform: 'translateX(calc(100% + var(--viewport-padding)))',
          },
          to: { transform: 'translateX(0)' },
        },
        swipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
        },
      },
      animation: {
        hide: 'hide 100ms ease-in',
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        swipeOut: 'swipeOut 100ms ease-out',
      },
    },
  },
  plugins: [],
};
