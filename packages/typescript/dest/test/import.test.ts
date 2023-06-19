import { job, test, expect } from '../src/index';

export const importTest: () => void = () => {
  job('import', () => {
    test('a', () => {
      expect('a').toBe('a');
    });
  });
};
