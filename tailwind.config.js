/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#a759d1",
        secondary: "#8261ee",
        dark: "#1d1d1d",
      },
      backgroundImage: {
        gradient:
          "linear-gradient(90deg, #a759d1 0%, #8261ee 29%, #ff1362, 67%, #fc4242 80%, #a759d1 100%)",
      },
      gridTemplateColumns: {
        queue: "3rem 3fr 4fr 6fr 6fr 5rem 2fr 2fr 3rem",
        queueMobile: "3rem 1fr 3rem",
      },
      boxShadow: {
        default: "0 1px 2px 0 rgba(0, 0, 0, .5);",
        defaultInverse: "0px -1px 2px 0px rgba(0,0,0,0.25);",
      },
    },
  },
  plugins: [],
};
