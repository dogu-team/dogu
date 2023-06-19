import { afterAll, afterEach, beforeAll, beforeEach, Dest, expect, job, test } from '../src/index';
import { importTest } from './import.test';

Dest.withOptions({
  timeout: 180 * 1000,
}).describe(() => {
  job('main', () => {
    beforeEach(() => {
      console.log('beforeEach');
    });

    afterEach(() => {
      console.log('afterEach');
    });

    beforeAll(() => {
      console.log('before All');
    });

    afterAll(() => {
      console.log('after All');
    });

    test('1-t', () => {
      console.log('1-t');
    });

    test('2-t', () => {
      console.log('2-t');
    });

    test('3-t', () => {
      console.log('3-t');
    });

    test('4-t', () => {
      // expect('a').toBe('c');
    });

    test('5-t', () => {
      console.log('5-t');
    });

    job('sub', () => {
      test('6-t', () => {
        console.log('6-t');
      });

      job('sub - 2', () => {
        test('7-t', () => {
          console.log('7-t');
        });

        job('sub - 3', () => {
          test('8-t', () => {
            console.log('8-t');
          });

          job('sub - 4', () => {
            test('9-t', () => {
              expect('a').toBe('b');
            });
          });
        });
      });
    });

    test('10-t', () => {
      expect('a').toBe('a');
    });

    test('11-t', () => {
      expect('b').toBe('b');
    });

    job('11', () => {
      test('11-t', () => {
        console.log('11-t');
      });

      job('12', () => {
        test('12-t', () => {
          expect('a').toBe('c');
        });

        job('13', () => {
          test('13-t', () => {
            console.log('13-t');
          });

          job('14', () => {
            test('14-t', () => {
              expect('a').toBe('a');
            });
          });
        });
      });
    });

    importTest();
  });
});
