import lodash from 'lodash';
import { ConsoleLogger, Printable } from './logs';
import { stringify } from './strings/functions';
import { delay } from './utilities/functions';
import { PromiseOrValue } from './utilities/types';

export interface RetryOptions {
  /**
   * @default 3
   */
  retryCount?: number;

  /**
   * @default 300
   * @unit milliseconds
   */
  retryInterval?: number;

  /**
   * @default ConsoleLogger.instance
   */
  printable?: Printable;

  /**
   * @default () => true (always retry)
   */
  resultChecker?: <Result>(result: PromiseOrValue<Result>) => boolean;
}

type FilledRetryOptions = Required<RetryOptions>;

function defaultRetryOptions(): FilledRetryOptions {
  return {
    retryCount: 3,
    retryInterval: 300,
    printable: ConsoleLogger.instance,
    resultChecker: () => true,
  };
}

function fillRetryOptions(options?: RetryOptions): FilledRetryOptions {
  return lodash.merge(defaultRetryOptions(), options);
}

export async function retry<Result>(func: () => PromiseOrValue<Result>, options?: RetryOptions): Promise<Result> {
  const { retryCount, retryInterval, printable, resultChecker } = fillRetryOptions(options);
  const currentTime = Date.now();
  let lastError: Error | null = null;
  for (let tryCount = 1; tryCount <= retryCount; tryCount++) {
    let isPromiseResult = false;
    try {
      const result = func();
      const isSuccess = resultChecker(result);
      if (!isSuccess) {
        throw new Error('result checker failed');
      }

      isPromiseResult = 'then' in result && typeof result.then === 'function';
      if (isPromiseResult) {
        return await result;
      } else {
        return result;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(stringify(error));
      printable.error(`Retry failed`, { tryCount, retryCount, retryInterval, error: lastError });
    }
    if (isPromiseResult && tryCount < retryCount) {
      printable.warn?.(`Retry after ${retryInterval} milliseconds`, { tryCount, retryCount, retryInterval });
      const deltaTime = Date.now() - currentTime;
      const sleepTime = retryInterval - deltaTime;
      if (sleepTime > 0) {
        await delay(sleepTime);
      }
    }
  }
  if (lastError) {
    throw lastError;
  } else {
    throw new Error(`Retry failed`);
  }
}

export function Retry(options?: RetryOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const method = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = function (...args: any[]): any {
      return retry(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return method.apply(this, args);
      }, options);
    };
  };
}
