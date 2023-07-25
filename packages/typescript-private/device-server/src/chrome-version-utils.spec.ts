import { describe, expect, test } from '@jest/globals';
import { ChromeVersionLike, compareChromeVersionLike, findChromeVersionLike, parseChromeVersionLike } from './chrome-version-utils';

describe('parseChromeVersionLike', () => {
  test('1', () => {
    expect(parseChromeVersionLike('1')).toEqual({
      major: 1,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('1.2', () => {
    expect(parseChromeVersionLike('1.2')).toEqual({
      major: 1,
      minor: 2,
      build: undefined,
      patch: undefined,
    });
  });

  test('1.2.3', () => {
    expect(parseChromeVersionLike('1.2.3')).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: undefined,
    });
  });

  test('1.2.3.4', () => {
    expect(parseChromeVersionLike('1.2.3.4')).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: 4,
    });
  });

  test('invalid format "" (empty string)', () => {
    expect(parseChromeVersionLike('')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.', () => {
    expect(parseChromeVersionLike('1.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.2.', () => {
    expect(parseChromeVersionLike('1.2.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.2.3.', () => {
    expect(parseChromeVersionLike('1.2.3.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });

  test('invalid format 1.2.3.4.', () => {
    expect(parseChromeVersionLike('1.2.3.4.')).toEqual({
      major: undefined,
      minor: undefined,
      build: undefined,
      patch: undefined,
    });
  });
});

describe('compareChromeVersionLike', () => {
  describe('major.minor.build.patch vs', () => {
    test('less than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: 3, patch: 4 }, { major: 1, minor: 2, build: 3, patch: 5 })).toBeLessThan(0);
    });

    test('equal', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: 3, patch: 4 }, { major: 1, minor: 2, build: 3, patch: 4 })).toBe(0);
    });

    test('greater than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: 3, patch: 5 }, { major: 1, minor: 2, build: 3, patch: 4 })).toBeGreaterThan(0);
    });
  });

  describe('major.minor.build vs', () => {
    test('less than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: 3, patch: undefined }, { major: 1, minor: 2, build: 4, patch: undefined })).toBeLessThan(0);
    });

    test('equal', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: 3, patch: undefined }, { major: 1, minor: 2, build: 3, patch: undefined })).toBe(0);
    });

    test('greater than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: 4, patch: undefined }, { major: 1, minor: 2, build: 3, patch: undefined })).toBeGreaterThan(0);
    });
  });

  describe('major.minor vs', () => {
    test('less than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: undefined, patch: undefined }, { major: 1, minor: 3, build: undefined, patch: undefined })).toBeLessThan(0);
    });

    test('equal', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 2, build: undefined, patch: undefined }, { major: 1, minor: 2, build: undefined, patch: undefined })).toBe(0);
    });

    test('greater than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: 3, build: undefined, patch: undefined }, { major: 1, minor: 2, build: undefined, patch: undefined })).toBeGreaterThan(0);
    });
  });

  describe('major vs', () => {
    test('less than', () => {
      expect(
        compareChromeVersionLike({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 2, minor: undefined, build: undefined, patch: undefined }),
      ).toBeLessThan(0);
    });

    test('equal', () => {
      expect(compareChromeVersionLike({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: undefined, build: undefined, patch: undefined })).toBe(
        0,
      );
    });

    test('greater than', () => {
      expect(
        compareChromeVersionLike({ major: 2, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: undefined, build: undefined, patch: undefined }),
      ).toBeGreaterThan(0);
    });
  });

  describe('major vs major.minor', () => {
    test('less than', () => {
      expect(compareChromeVersionLike({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: 1, build: undefined, patch: undefined })).toBeLessThan(
        0,
      );
    });

    test('equal', () => {
      expect(compareChromeVersionLike({ major: 1, minor: undefined, build: undefined, patch: undefined }, { major: 1, minor: 0, build: undefined, patch: undefined })).toBe(0);
    });

    test('greater than', () => {
      expect(
        compareChromeVersionLike({ major: 1, minor: 1, build: undefined, patch: undefined }, { major: 1, minor: undefined, build: undefined, patch: undefined }),
      ).toBeGreaterThan(0);
    });
  });
});

describe('findChromeVersionLike', () => {
  test('major.minor.build.patch', () => {
    expect(findChromeVersionLike({ major: 1, minor: 2, build: 3, patch: 4 }, [{ major: 1, minor: 2, build: 3, patch: 4 }])).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: 4,
    });
  });

  test('major.minor.build', () => {
    expect(findChromeVersionLike({ major: 1, minor: 2, build: 3, patch: undefined }, [{ major: 1, minor: 2, build: 3, patch: 4 }])).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: 4,
    });
  });

  test('major.minor', () => {
    expect(findChromeVersionLike({ major: 1, minor: 2, build: undefined, patch: undefined }, [{ major: 1, minor: 2, build: 3, patch: 4 }])).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: 4,
    });
  });

  test('major', () => {
    expect(findChromeVersionLike({ major: 1, minor: undefined, build: undefined, patch: undefined }, [{ major: 1, minor: 2, build: 3, patch: 4 }])).toEqual({
      major: 1,
      minor: 2,
      build: 3,
      patch: 4,
    });
  });
});

describe('real world', () => {
  test('115 to 115.0.5790.102', () => {
    const requestVersion = parseChromeVersionLike('115');
    const serverVersions = [parseChromeVersionLike('115.0.5790.102')] as Required<ChromeVersionLike>[];
    const resolvedVersion = findChromeVersionLike(requestVersion, serverVersions);
    expect(resolvedVersion).toEqual({
      major: 115,
      minor: 0,
      build: 5790,
      patch: 102,
    });
  });

  test('115.0 to 115.0.5790.102', () => {
    const requestVersion = parseChromeVersionLike('115.0');
    const serverVersions = [parseChromeVersionLike('115.0.5790.102')] as Required<ChromeVersionLike>[];
    const resolvedVersion = findChromeVersionLike(requestVersion, serverVersions);
    expect(resolvedVersion).toEqual({
      major: 115,
      minor: 0,
      build: 5790,
      patch: 102,
    });
  });

  test('115.0.5790 to 115.0.5790.102', () => {
    const requestVersion = parseChromeVersionLike('115.0.5790');
    const serverVersions = [parseChromeVersionLike('115.0.5790.102')] as Required<ChromeVersionLike>[];
    const resolvedVersion = findChromeVersionLike(requestVersion, serverVersions);
    expect(resolvedVersion).toEqual({
      major: 115,
      minor: 0,
      build: 5790,
      patch: 102,
    });
  });

  test('115.0.5790.102 to 115.0.5790.102', () => {
    const requestVersion = parseChromeVersionLike('115.0.5790.102');
    const serverVersions = [parseChromeVersionLike('115.0.5790.102')] as Required<ChromeVersionLike>[];
    const resolvedVersion = findChromeVersionLike(requestVersion, serverVersions);
    expect(resolvedVersion).toEqual({
      major: 115,
      minor: 0,
      build: 5790,
      patch: 102,
    });
  });

  test('115 to highest 115.0.5790.102', () => {
    const requestVersion = parseChromeVersionLike('115');
    const serverVersions = ['115.0.5790.101', '115.0.5790.102'].map(parseChromeVersionLike) as Required<ChromeVersionLike>[];
    serverVersions.sort((lhs, rhs) => compareChromeVersionLike(lhs, rhs, 'desc'));
    const resolvedVersion = findChromeVersionLike(requestVersion, serverVersions);
    expect(resolvedVersion).toEqual({
      major: 115,
      minor: 0,
      build: 5790,
      patch: 102,
    });
  });
});
