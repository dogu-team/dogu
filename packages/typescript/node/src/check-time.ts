import { Printable } from '@dogu-tech/common';

export async function checkTime<T>(name: string, promise: Promise<T>, printable: Printable): Promise<T> {
  const startTime = performance.now();
  const ret: T = await promise;
  const endTime = performance.now();
  printable.info(`[CheckTime] ${name}.elapsed ${((endTime - startTime) / 1000).toFixed(2)}s`);
  return ret;
}

export class CheckTimer {
  constructor(private logger: Printable) {}

  async check<T>(name: string, promise: Promise<T>): Promise<T> {
    return checkTime(name, promise, this.logger);
  }
}
