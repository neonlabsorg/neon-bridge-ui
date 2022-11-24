const path = require('path');
const tailwindcss = require('tailwindcss');
const VersionFile = require('webpack-version-file');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const packageJson = require('./package.json');
require('dotenv').config({ path: `./env/${process.env.ENV_CONFIG ?? `.env`}` });

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
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
          tokenListVersion: process.env.REACT_APP_TOKEN_LIST
        }
      }),
      new NodePolyfillPlugin({ excludeAliases: ['console'] })
    ],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer')
    }
  },
  postcss: {
    plugins: [tailwindcss('./tailwind.config.js'), require('autoprefixer')]
  }
};
