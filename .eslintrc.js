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
  plugins: ['prettier', 'simple-import-sort'],
  parser: '@typescript-eslint/parser',
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_|e$' }],
    // 'curly': ['error', 'multi-line'],
    // 'newline-before-return': 'error',

    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^react', '^@solana', '^@web3', '^web3', '^'],
          ['^@/', '^@/assets/', '^\\.', '^\\u0000'],
        ],
      },
    ],
  },
}
