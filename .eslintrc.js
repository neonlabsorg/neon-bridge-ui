module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  globals: {
    globalThis: false
  },
  extends: ['eslint:recommended'],
  plugins: ['prettier', 'simple-import-sort'],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-unused-vars': 'off'
  }
};
