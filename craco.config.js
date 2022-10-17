const path = require('path');
const VersionFile = require('webpack-version-file');
const packageJson = require('./package.json');
require('dotenv').config({ path: `./env/${process.env.ENV_CONFIG ?? `.env`}` });

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src/')
    },
    plugins: [
      new VersionFile({
        output: './build/version.txt',
        templateString: [
          '<%= name %>@<%= version %>',
          'Build date: <%= buildDate %>',
          'Portal version: <%= neonPortalVersion %>',
          'TokenList version: <%= tokenListVersion %>'
        ].join('\n'),
        data: {
          neonPortalVersion: packageJson.dependencies['neon-portal'],
          tokenListVersion: process.env.REACT_APP_TOKEN_LIST_VER
        }
      })
    ]
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')]
    }
  }
};
