import { expect, test } from '@jest/globals';

test('single test success', () => {
  expect(1).toBe(1);

  console.log(doguConfig.apiBaseUrl);

  driver.url('https://www.google.com');
});
