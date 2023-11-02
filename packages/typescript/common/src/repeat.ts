import lodash from 'lodash';
import { delay } from './utilities/functions';
import { PromiseOrValue } from './utilities/types';

export interface RepeatOptions {
  /**
   * @default 3
   */
  repeatCount?: number;

  /**
   * @default 300
   * @unit milliseconds
   */
  repeatInterval?: number;
}

type FilledRepeatOptions = Required<RepeatOptions>;

function defaultRepeatOptions(): FilledRepeatOptions {
  return {
    repeatCount: 3,
    repeatInterval: 300,
  };
}

function fillRepeatOptions(options?: RepeatOptions): FilledRepeatOptions {
  return lodash.merge(defaultRepeatOptions(), options);
}

export async function repeat(func: () => PromiseOrValue<void>, options?: RepeatOptions): Promise<void> {
  const { repeatCount, repeatInterval } = fillRepeatOptions(options);
  for (let tryCount = 1; tryCount <= repeatCount; tryCount++) {
    const result = await Promise.resolve(func());

    await delay(repeatInterval);
  }
}

export function Repeat(options?: RepeatOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const method = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = function (...args: any[]): any {
      return repeat(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        return method.apply(this, args);
      }, options);
    };
  };
}
