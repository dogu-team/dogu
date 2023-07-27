import { describe, expect, test } from '@jest/globals';
import { DateNano } from './date-nano';

describe('nanoseconds', () => {
  test('compare with milliseconds', () => {
    expect(BigInt(1690443005622000000n)).toBe(BigInt(1690443005622) * DateNano.nanosecondsPerMillisecond);
  });
});

describe('compare with Date', () => {
  describe('parse with milliseconds', () => {
    test('UTC', () => {
      expect(DateNano.parse('2023-01-01T01:01:01.123Z')).toBe(DateNano.fromMillisecondsSince1970(Date.parse('2023-01-01T01:01:01.123Z')).nanosecondsSince1970);
    });

    test('+01:00', () => {
      expect(DateNano.parse('2023-01-01T02:01:01.123+01:00')).toBe(DateNano.fromMillisecondsSince1970(Date.parse('2023-01-01T02:01:01.123+01:00')).nanosecondsSince1970);
    });

    test('-01:00', () => {
      expect(DateNano.parse('2023-01-01T00:01:01.123-01:00')).toBe(DateNano.fromMillisecondsSince1970(Date.parse('2023-01-01T00:01:01.123-01:00')).nanosecondsSince1970);
    });
  });

  describe('parse without milliseconds', () => {
    test('UTC', () => {
      expect(DateNano.parse('2023-01-01T01:01:01Z')).toBe(DateNano.fromMillisecondsSince1970(Date.parse('2023-01-01T01:01:01Z')).nanosecondsSince1970);
    });

    test('+01:00', () => {
      expect(DateNano.parse('2023-01-01T02:01:01+01:00')).toBe(DateNano.fromMillisecondsSince1970(Date.parse('2023-01-01T02:01:01+01:00')).nanosecondsSince1970);
    });

    test('-01:00', () => {
      expect(DateNano.parse('2023-01-01T00:01:01-01:00')).toBe(DateNano.fromMillisecondsSince1970(Date.parse('2023-01-01T00:01:01-01:00')).nanosecondsSince1970);
    });
  });
});

describe('DateNano.parse', () => {
  describe('with nanoseconds', () => {
    test('RFC3339Nano UTC', () => {
      expect(DateNano.parse('2023-01-01T01:01:01.123456789Z')).toBe(1672534861123456789n);
    });

    test('RFC3339Nano +00:00', () => {
      expect(DateNano.parse('2023-01-01T01:01:01.123456789+00:00')).toBe(1672534861123456789n);
    });

    test('RFC3339Nano -00:00', () => {
      expect(DateNano.parse('2023-01-01T01:01:01.123456789-00:00')).toBe(1672534861123456789n);
    });

    test('RFC3339Nano +01:00', () => {
      expect(DateNano.parse('2023-01-01T02:01:01.123456789+01:00')).toBe(1672534861123456789n);
    });

    test('RFC3339Nano -01:00', () => {
      expect(DateNano.parse('2023-01-01T00:01:01.123456789-01:00')).toBe(1672534861123456789n);
    });
  });

  describe('without nanoseconds', () => {
    test('RFC3339Nano UTC', () => {
      expect(DateNano.parse('2023-01-01T01:01:01Z')).toBe(1672534861000000000n);
    });

    test('RFC3339Nano +01:00', () => {
      expect(DateNano.parse('2023-01-01T02:01:01+01:00')).toBe(1672534861000000000n);
    });

    test('RFC3339Nano -01:00', () => {
      expect(DateNano.parse('2023-01-01T00:01:01-01:00')).toBe(1672534861000000000n);
    });
  });

  describe('with milliseconds', () => {
    test('RFC3339Nano UTC', () => {
      expect(DateNano.parse('2023-01-01T01:01:01.123Z')).toBe(1672534861123000000n);
    });

    test('RFC3339Nano +01:00', () => {
      expect(DateNano.parse('2023-01-01T02:01:01.123+01:00')).toBe(1672534861123000000n);
    });

    test('RFC3339Nano -01:00', () => {
      expect(DateNano.parse('2023-01-01T00:01:01.123-01:00')).toBe(1672534861123000000n);
    });
  });
});

describe('DateNano.toRFC3339Nano', () => {
  test('UTC', () => {
    expect(new DateNano(1672534861123456789n).toRFC3339Nano()).toBe('2023-01-01T01:01:01.123456789Z');
  });
});
