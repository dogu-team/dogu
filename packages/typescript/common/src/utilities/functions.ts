import { stringify } from '../strings/functions';
import { PromiseOrValue } from './types';

export async function* loop(delayMilliseconds: number, count = Infinity): AsyncGenerator<void> {
  for (let i = 0; ; ) {
    if (count !== Infinity) {
      if (!(i < count)) {
        break;
      }
    }
    yield;
    await delay(delayMilliseconds);
    if (count !== Infinity) {
      i++;
    }
  }
}

export async function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class DuplicatedCallGuarder {
  private isInProgress = false;

  async guard(onCall: () => PromiseOrValue<void>): Promise<void> {
    if (this.isInProgress) return;
    try {
      this.isInProgress = true;
      await onCall();
    } finally {
      this.isInProgress = false;
    }
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function errorify(value: unknown): Error {
  return isError(value) ? value : new Error(stringify(value));
}
