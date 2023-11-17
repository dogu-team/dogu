module.exports = {
  root: true,
  extends: [
    'eslint:recommended', //
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,

    /**
     * @note Please set the file explicitly. If you use the glob pattern, you may experience an error while loading tscconfig.
     */
    project: [
      './tsconfig.eslint.json', //
      // './tsconfig.json',
      './electron/tsconfig.json',
    ],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  rules: {
    quotes: 'off',
    'no-inner-declarations': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/prefer-namespace-keyword': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
  },
};
