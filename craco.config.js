const path = require("path");
const VersionFile = require("webpack-version-file");
const packageJson = require("./package.json");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
    plugins: [
      new VersionFile({
        output: "./build/version.txt",
        templateString: [
          "<%= name %>@<%= version %>",
          "Build date: <%= buildDate %>",
          "Portal version: <%= neonPortalVersion %>",
        ].join("\n"),
        data: {
          neonPortalVersion: packageJson.dependencies["neon-portal"],
        },
      }),
    ],
  },
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};
