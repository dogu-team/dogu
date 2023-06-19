import { stringify } from '@dogu-tech/common';

export const L10n = ['en', 'ko'] as const;
export type L10n = (typeof L10n)[number];

export function createL10nMap<T>(entries: { l10n: L10n; value: T }[]): Map<L10n, T> {
  const map = new Map<L10n, T>();
  entries.forEach(({ l10n, value }) => {
    map.set(l10n, value);
  });
  return map;
}

export function createL10nFunction<T>(l10nMap: Map<L10n, T>, l10n: L10n): (key: keyof T) => string {
  const values = l10nMap.get(l10n);
  if (!values) {
    throw new Error(`Unknown l10n: ${l10n}`);
  }
  return (key: keyof T) => {
    const value = values[key];
    if (!value) {
      throw new Error(`Unknown key: ${stringify(key)}`);
    }
    if (typeof value !== 'string') {
      throw new Error(`Invalid value: ${stringify(value)}`);
    }
    return value;
  };
}
