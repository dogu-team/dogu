/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: './build/esm/src/environment/index.js',
  bail: true,
};
