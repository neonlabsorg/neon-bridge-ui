module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    globalThis: false,
  },
  extends: ['eslint:recommended'],
  plugins: ['prettier'],
  parser: '@typescript-eslint/parser',
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_|e$' }],
  },
}
