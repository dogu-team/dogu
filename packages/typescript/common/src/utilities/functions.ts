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

export async function* loopTime(periodMilisec: number, expireTimeMilisec: number): AsyncGenerator<void> {
  const startTime = Date.now();
  for (let _ = 0; ; ) {
    const curTime = Date.now();
    if (curTime - startTime > expireTimeMilisec) {
      break;
    }

    yield;
    const remainTime = periodMilisec - (Date.now() - curTime);
    await delay(remainTime);
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

export interface CallAsyncWithTimeoutOptions {
  /**
   * @unit milliseconds
   */
  timeout: number;

  /**
   * @default 'Timeout error ${timeout}ms'
   * @example 'Timeout error 1000ms'
   * @description The error message when the timeout is reached. The timeout is replaced with the actual timeout value.
   */
  timeoutErrorMessage?: string;
}

export async function callAsyncWithTimeout<T>(returningPromise: Promise<T>, options: CallAsyncWithTimeoutOptions): Promise<T> {
  const { timeout } = options;
  const timeoutErrorMessage = options.timeoutErrorMessage ?? `Timeout occurred after ${timeout}ms`;
  let returned = false;
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (returned) return;
      returned = true;
      reject(new Error(timeoutErrorMessage));
    }, timeout);
    returningPromise
      .then((value) => {
        if (returned) return;
        returned = true;
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        if (returned) return;
        returned = true;
        clearTimeout(timeoutId);
        reject(errorify(error));
      });
  });
}

export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export async function filterAsync<T>(array: T[], predicate: (value: T) => Promise<boolean>): Promise<T[]> {
  const results = await Promise.all(array.map(predicate));
  return array.filter((_, index) => results[index]);
}
