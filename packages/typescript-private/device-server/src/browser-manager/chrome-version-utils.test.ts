import { describe, expect, test } from '@jest/globals';
import { chromeVersionUtils } from './chrome-version-utils';

describe('chromeVersionUtils.parse', () => {
  test('1', () => {
    expect(chromeVersionUtils.parse('1')).toEqual({
      major: 1,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('1.2', () => {
    expect(chromeVersionUtils.parse('1.2')).toEqual({
      major: 1,
      minor: 2,
      build: undefined,
      patch: undefined,
    });
  });

  test('1.2.3', () => {
    expect(chromeVersionUtils.parse('1.2.3')).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: undefined,
    });
  });

  test('1.2.3.4', () => {
    expect(chromeVersionUtils.parse('1.2.3.4')).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: 4,
    });
  });

  test('invalid format "" (empty string)', () => {
    expect(chromeVersionUtils.parse('')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.', () => {
    expect(chromeVersionUtils.parse('1.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.2.', () => {
    expect(chromeVersionUtils.parse('1.2.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.2.3.', () => {
    expect(chromeVersionUtils.parse('1.2.3.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.2.3.4.', () => {
    expect(chromeVersionUtils.parse('1.2.3.4.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });
});

describe('chromeVersionUtils.compareWithAsc', () => {
  describe('major.minor.build.patch vs', () => {
    test('less than', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: 3, patch: 4 }, { major: 1, minor: 2, build: 3, patch: 5 })).toBeLessThan(0);
    });

    test('equal', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: 3, patch: 4 }, { major: 1, minor: 2, build: 3, patch: 4 })).toBe(0);
    });

    test('greater than', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: 3, patch: 5 }, { major: 1, minor: 2, build: 3, patch: 4 })).toBeGreaterThan(0);
    });
  });

  describe('major.minor.build vs', () => {
    test('less than', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: 3, patch: undefined }, { major: 1, minor: 2, build: 4, patch: undefined })).toBeLessThan(0);
    });

    test('equal', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: 3, patch: undefined }, { major: 1, minor: 2, build: 3, patch: undefined })).toBe(0);
    });

    test('greater than', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: 4, patch: undefined }, { major: 1, minor: 2, build: 3, patch: undefined })).toBeGreaterThan(0);
    });
  });

  describe('major.minor vs', () => {
    test('less than', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: undefined, patch: undefined }, { major: 1, minor: 3, build: undefined, patch: undefined }),
      ).toBeLessThan(0);
    });

    test('equal', () => {
      expect(chromeVersionUtils.compareWithAsc({ major: 1, minor: 2, build: undefined, patch: undefined }, { major: 1, minor: 2, build: undefined, patch: undefined })).toBe(0);
    });

    test('greater than', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: 3, build: undefined, patch: undefined }, { major: 1, minor: 2, build: undefined, patch: undefined }),
      ).toBeGreaterThan(0);
    });
  });

  describe('major vs', () => {
    test('less than', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 2, minor: undefined, build: undefined, patch: undefined }),
      ).toBeLessThan(0);
    });

    test('equal', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: undefined, build: undefined, patch: undefined }),
      ).toBe(0);
    });

    test('greater than', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 2, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: undefined, build: undefined, patch: undefined }),
      ).toBeGreaterThan(0);
    });
  });

  describe('major vs major.minor', () => {
    test('less than', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: 1, build: undefined, patch: undefined }),
      ).toBeLessThan(0);
    });

    test('equal', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: 0, build: undefined, patch: undefined }),
      ).toBe(0);
    });

    test('greater than', () => {
      expect(
        chromeVersionUtils.compareWithAsc({ major: 1, minor: 1, build: undefined, patch: undefined }, { major: 1, minor: undefined, build: undefined, patch: undefined }),
      ).toBeGreaterThan(0);
    });
  });
});
