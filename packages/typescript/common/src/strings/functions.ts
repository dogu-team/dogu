import { stringifier, StringifyOptions } from './stringifier';

export function stringify(value: unknown, options?: StringifyOptions): string {
  return stringifier.stringify(value, options);
}

export function stringifyError(value: unknown): string {
  return stringifyAllProps(value);
}

export function stringifyAllProps(value: unknown): string {
  if (null == value) {
    return 'null';
  }
  if (undefined == value) {
    return 'undefined';
  }
  return JSON.stringify(value, Object.getOwnPropertyNames(value), 2).replaceAll('\\n', '\n');
}

export function splitWithExclude(str: string, separator: ' ' | ',' | '=', excludes: string[]): string[] {
  const ret: string[] = [];
  let latestIndex = 0;
  for (let index = 0; index < str.length; index++) {
    const element = str[index];
    if (element !== separator) continue;

    let isNoSplit = false;
    for (const exclude of excludes) {
      const startIndex = index + 1 - exclude.length;
      if (startIndex < 0) continue;
      const compareSubstr = str.substring(startIndex, index + 1);
      if (compareSubstr === exclude) {
        isNoSplit = true;
        break;
      }
    }
    if (isNoSplit) {
      continue;
    }

    const subStr = str.substring(latestIndex, index);
    ret.push(subStr);
    latestIndex = index + 1;
  }
  const subStr = str.substring(latestIndex);
  ret.push(subStr);

  return ret;
}

export function isStringEmpty(str: string | undefined | null): boolean {
  return str === undefined || str === null || (typeof str === 'string' && str.length === 0);
}

export function toISOStringWithTimezone(date: Date, timeDelimeter = ':'): string {
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? '+' : '-';
  const pad: (n: number) => string = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
  return (
    String(date.getFullYear()) +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    timeDelimeter +
    pad(date.getMinutes()) +
    timeDelimeter +
    pad(date.getSeconds()) +
    '.' +
    pad(date.getMilliseconds()) +
    diff +
    pad(tzOffset / 60) +
    timeDelimeter +
    pad(tzOffset % 60)
  );
}

export function replaceString(target: string, index: number, length: number, replacement: string): string {
  return target.substring(0, index) + replacement + target.substring(index + length);
}
