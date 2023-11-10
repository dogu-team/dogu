import { Printable } from '@dogu-tech/common';
import lodash from 'lodash';

export interface CheckTimerOption {
  logger: Printable;
  /**
   * @default [CheckTime]
   */
  prefix?: string;
  /**
   * @default false
   */
  logOnStart?: boolean;
  /**
   * @default true
   */
  logOnEnd?: boolean;
}

function defaultCheckTimerOption(): CheckTimerOption {
  return {
    logger: console,
    prefix: '[CheckTime]',
    logOnStart: false,
    logOnEnd: true,
  };
}

function fillCheckTimerOption(options?: CheckTimerOption): CheckTimerOption {
  return lodash.merge(defaultCheckTimerOption(), options);
}

export async function checkTime<T>(name: string, promise: Promise<T>, option: CheckTimerOption): Promise<T> {
  const filledOption = fillCheckTimerOption(option);
  const startTime = performance.now();
  if (filledOption.logOnStart) {
    filledOption.logger.info(`${filledOption.prefix} ${name}.start`);
  }
  const ret: T = await promise;
  const endTime = performance.now();
  if (filledOption.logOnEnd) {
    filledOption.logger.info(`${filledOption.prefix} ${name}.end ${((endTime - startTime) / 1000).toFixed(2)}s`);
  }
  return ret;
}

export class CheckTimer {
  constructor(private option: CheckTimerOption) {}

  async check<T>(name: string, promise: Promise<T>): Promise<T> {
    return checkTime(name, promise, this.option);
  }
}
