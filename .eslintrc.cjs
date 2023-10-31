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
      './projects/billing-server/tsconfig.json',
      './projects/console-web-front/tsconfig.json',
      './projects/console-web-server/tsconfig.json',
      './packages/typescript/action-common/tsconfig.json',
      './packages/typescript/action-kit/tsconfig.json',
      './packages/typescript/common/tsconfig.json',
      './packages/typescript/console-action/tsconfig.json',
      './packages/typescript/console-dest/tsconfig.json',
      './packages/typescript/console-gamium/tsconfig.json',
      './packages/typescript/console-remote-dest/tsconfig.json',
      './packages/typescript/dest/tsconfig.json',
      './packages/typescript/device-client/tsconfig.json',
      './packages/typescript/device-client-common/tsconfig.json',
      './packages/typescript/env-tools/tsconfig.json',
      './packages/typescript/node/tsconfig.json',
      './packages/typescript/toolkit/tsconfig.json',
      './packages/typescript/types/tsconfig.json',
      './packages/typescript-private/console/tsconfig.json',
      './packages/typescript-private/console-host-agent/tsconfig.json',
      './packages/typescript-private/console-open-api/tsconfig.json',
      './packages/typescript-private/device-server/tsconfig.json',
      './packages/typescript-private/dogu-agent-core/tsconfig.json',
      './packages/typescript-private/dost-children/tsconfig.json',
      './packages/typescript-private/host-agent/tsconfig.json',
      './packages/typescript-private/nestjs-common/tsconfig.json',
      './packages/typescript-private/types/tsconfig.json',
      './packages/typescript-private/webrtc/tsconfig.json',
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
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
  },
};
