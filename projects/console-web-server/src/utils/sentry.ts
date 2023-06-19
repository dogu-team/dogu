import * as Sentry from '@sentry/node';
import Transport from 'winston-transport';
import { env } from '../env';

export function isSentryEnabled(): boolean {
  return env.DOGU_RUN_TYPE === 'production' || env.DOGU_RUN_TYPE === 'development';
}

export class SentryBreadCrumbTrasponrt extends Transport {
  override log(info: any, callback: () => void) {
    Sentry.addBreadcrumb({
      type: 'default',
      category: info.level,
      message: info.message,
      level: info.level,
      data: info.meta,
    });
    callback();
  }
}
