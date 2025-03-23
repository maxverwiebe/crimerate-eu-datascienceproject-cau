// next.config.js (root)
const withTM = require("next-transpile-modules")([
  /* your module names here, if any */
]);

module.exports = withTM({
  reactStrictMode: true,
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        module: false,
      };
    }
    return config;
  },
});
