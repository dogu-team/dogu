import util from 'util';

export function stringify(value: unknown): string {
  return util.inspect(value);
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function errorify(value: unknown): Error {
  return isError(value) ? value : new Error(stringify(value));
}
