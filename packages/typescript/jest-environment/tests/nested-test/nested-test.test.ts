import { describe, expect, test } from '@jest/globals';

test('t test', () => {
  expect(1).toBe(1);
});

describe('d describe', () => {});

describe('d/t describe', () => {
  test('d/t test', () => {
    expect(1).toBe(1);
  });
});

describe('d/[tt] describe', () => {
  test('d/[tt] test1', () => {
    expect(1).toBe(1);
  });

  test('d/[tt] test2', () => {
    expect(1).toBe(1);
  });
});

describe('d/d/t describe1', () => {
  describe('d/d/t describe2', () => {
    test('d/d/t test', () => {
      expect(1).toBe(2);
    });
  });
});

describe('d/[t,d/t] describe1', () => {
  test('d/[t,d/t] test1', () => {
    expect(1).toBe(1);
  });

  describe('d/[t,d/t] describe2', () => {
    test('d/[t,d/t] test2', () => {
      expect(1).toBe(1);
    });
  });
});

describe('d/[t,d/t,t] describe1', () => {
  test('d/[t,d/t,t] test1', () => {
    expect(1).toBe(1);
  });

  describe('d/[t,d/t,t] describe2', () => {
    test('d/[t,d/t,t] test2', () => {
      expect(1).toBe(1);
    });
  });

  test('d/[t,d/t,t] test3', () => {
    expect(1).toBe(1);
  });
});
