import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  verbose: true,
  transform: {},
  testRegex: '(src|tests).+test.ts$',
};

export default config;
