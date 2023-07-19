import { expect, test } from '@jest/globals';

test('single test success', () => {
  expect(1).toBe(1);

  driver.url('https://www.google.com');
});
