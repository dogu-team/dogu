import { Printable } from '@dogu-tech/common';
import { logger } from '../../logger/logger.instance';

export async function checkTime<T>(name: string, promise: Promise<T>, printable: Printable = logger): Promise<T> {
  const startTime = performance.now();
  const ret: T = await promise;
  const endTime = performance.now();
  printable.info(`[CheckTime] ${name}.elapsed ${((endTime - startTime) / 1000).toFixed(2)}s`);
  return ret;
}
