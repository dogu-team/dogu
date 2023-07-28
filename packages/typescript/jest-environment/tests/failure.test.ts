import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from '@jest/globals';

beforeEach(() => {
  console.log('beforeEach 1-1');
});

beforeEach(() => {
  console.log('beforeEach 1-2');
});

afterEach(() => {
  console.log('afterEach 1-1');
});

afterEach(() => {
  console.log('afterEach 1-2');
});

beforeAll(() => {
  console.log('beforeAll 1-1');
});

beforeAll(() => {
  console.log('beforeAll 1-2');
});

afterAll(() => {
  console.log('afterAll 1-1');
});

afterAll(() => {
  console.log('afterAll 1-2');
});

test('test 1', () => {
  console.log('test 1');
  throw new Error('test 1 error');
});

describe('describe 1', () => {
  beforeAll(() => {
    console.log('beforeAll 2-1');
  });

  beforeAll(() => {
    console.log('beforeAll 2-2');
  });

  afterAll(() => {
    console.log('afterAll 2-1');
  });

  afterAll(() => {
    console.log('afterAll 2-2');
  });

  beforeEach(() => {
    console.log('beforeEach 2-1');
  });

  beforeEach(() => {
    console.log('beforeEach 2-2');
  });

  afterEach(() => {
    console.log('afterEach 2-1');
  });

  afterEach(() => {
    console.log('afterEach 2-2');
  });

  test('test 2', () => {
    console.log('test 2');
  });
});

test('test 3', () => {
  console.log('test 3');
});
