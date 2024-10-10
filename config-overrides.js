const { override, addWebpackModuleRule } = require("customize-cra");

module.exports = override(
  addWebpackModuleRule({
    test: /\.s[ac]ss$/i,
    use: [
      "style-loader",
      "css-loader",
      {
        loader: "sass-loader",
        options: {
          api: "modern", // Use the modern API here
        },
      },
    ],
  }),

  (config) => {
    // Tweak source-map-loader to ignore missing source maps
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((loader) => {
          if (loader.loader && loader.loader.includes("source-map-loader")) {
            loader.exclude = [/node_modules/]; // Ignore missing maps in node_modules
          }
        });
      }
    });

    return config;
  }
);
