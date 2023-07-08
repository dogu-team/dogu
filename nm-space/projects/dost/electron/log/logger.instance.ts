import { DoguRunType } from '@dogu-private/env-tools';
import { LogLevel } from '@dogu-tech/common';
import { LoggerFactory } from '@dogu-tech/node';

export const logger = LoggerFactory.createLazy('main');
export const rendererLogger = LoggerFactory.createLazy('renderer');

export function getLogLevel(runType: DoguRunType): LogLevel {
  if (process.env.DOGU_LOG_LEVEL && LogLevel.includes(process.env.DOGU_LOG_LEVEL as LogLevel)) {
    return process.env.DOGU_LOG_LEVEL as LogLevel;
  }
  if (runType === 'production' || runType === 'self-hosted') {
    return 'info';
  }
  return 'verbose';
}
