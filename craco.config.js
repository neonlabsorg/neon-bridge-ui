const path = require("path");
const VersionFile = require("webpack-version-file");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
    plugins: [
      new VersionFile({
        output: "./build/version.txt",
      }),
    ],
  },
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};
