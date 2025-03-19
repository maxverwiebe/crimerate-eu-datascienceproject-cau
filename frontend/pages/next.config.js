const withTM = require("next-transpile-modules")([
  "react-heatmap-grid",
  "react-sequence",
]);

const path = require("path");

module.exports = withTM({
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    };
    return config;
  },
});
