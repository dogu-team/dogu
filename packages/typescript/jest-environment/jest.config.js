/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: './build/esm/src/environment/index.js',
  preset: 'ts-jest',
  globalSetup: './build/esm/src/setup.js',
  globalTeardown: './build/esm/src/teardown.js',
};
