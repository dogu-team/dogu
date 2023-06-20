import { Closable, errorify, isFunction, Printable } from '@dogu-tech/common';
import fs from 'fs';
import { glob } from 'glob';

export type Day = `${number}d`;
export type Period = Day;

export function isPeriod(period: string): period is Period {
  return period.endsWith('d');
}

export function validatePeriod(period: string): void {
  if (!isPeriod(period)) {
    throw new Error('period must be end with "d"');
  }
}

export function periodToMilliseconds(period: Period): number {
  validatePeriod(period);
  const number = Number(period.replace('d', ''));
  return number * 24 * 60 * 60 * 1000;
}

export async function deleteOldFiles(dir: string, maxStorePeriod: Period, printable: Printable): Promise<void> {
  const maxStorePeriodTime = periodToMilliseconds(maxStorePeriod);
  const files = await glob(`${dir}/**/*`);
  if (files.length === 0) {
    return;
  }
  const now = new Date().getTime();

  async function deleteOldFile(file: string): Promise<void> {
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) {
      return;
    }
    const lastModified = stat.mtime.getTime();
    if (now - lastModified > maxStorePeriodTime) {
      printable.info(`Deleting old file`, {
        file,
        lastModified,
        now,
        maxStorePeriodTime,
      });
      await fs.promises.unlink(file);
      printable.info(`Deleted old file: ${file}`);
    }
  }

  /**
   * @note files.map TypeError: files.map is not a function
   */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (!isFunction(files.map)) {
    printable.error(`files.map is not a function`, {
      files,
    });
    return;
  }
  const promises = files.map((file) => deleteOldFile(file));
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
  if (rejected.length > 0) {
    printable.error(`Failed to delete old files`, {
      rejected,
    });
  }
}

export class DeleteOldFilesCloser implements Closable {
  private timer: NodeJS.Timer | null;

  constructor(timer: NodeJS.Timer, private readonly printable: Printable) {
    this.timer = timer;
  }

  close(): void {
    if (this.timer === null) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
    this.printable.info(`Stopped delete old files timer`);
  }
}

export async function openDeleteOldFiles(dir: string, maxStorePeriod: Period, triggerPeriod: Period, printable: Printable): Promise<DeleteOldFilesCloser> {
  const triggerPeriodTime = periodToMilliseconds(triggerPeriod);
  await deleteOldFiles(dir, maxStorePeriod, printable);
  const timer = setInterval(() => {
    deleteOldFiles(dir, maxStorePeriod, printable).catch((error) => {
      printable.error(`Failed to delete old files`, {
        error: errorify(error),
      });
    });
  }, triggerPeriodTime);
  return new DeleteOldFilesCloser(timer, printable);
}
