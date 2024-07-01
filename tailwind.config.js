/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#a759d1",
        secondary: "#6240D0",
        dark: "#1d1d1d",
      },
      backgroundColor: {
        grad: "linear-gradient(90deg, #a759d1 0%, #6240D0 29%, #ff1362, 67%, #fc4242 80%, #a759d1 100%)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      gridTemplateColumns: {
        queue: "3rem 3fr 4fr 6fr 6fr 5rem 2fr 2fr 3rem",
        queueMobile: "3rem 1fr 3rem",
        clothing: "3rem 3fr 3fr 8fr 4fr 2fr 2fr 3fr 3rem 1px",
        adminUserTable: "8fr 3fr 3fr 4rem 4rem",
        supacolor: "3rem 2fr 2fr 2fr 1.5fr 1.5fr 9rem",
      },
      boxShadow: {
        default: "0 1px 2px 0 rgba(0, 0, 0, .5);",
        defaultInverse: "0px -1px 2px 0px rgba(0,0,0,0.25);",
      },
      width: {
        fit: "fit-content",
      },
    },
  },
  plugins: [],
};
