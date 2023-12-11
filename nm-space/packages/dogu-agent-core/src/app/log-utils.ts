import { DoguRunType } from '@dogu-private/types';
import { LogLevel } from '@dogu-tech/common';
import { AppConfigService } from './app-config/service';

/*
 * DOGU_LOG_LEVEL
 * Priority: config > env > runType
 */
export function getLogLevel(runType: DoguRunType, configService: AppConfigService): LogLevel {
  let currentLogLevel = getRunTypeLogLevel(runType);
  const envLogLevel = getEnvLogLevel();
  if (envLogLevel) {
    currentLogLevel = envLogLevel;
  }
  const configLogLevel = configService.getOrDefault('DOGU_LOG_LEVEL', currentLogLevel);
  return configLogLevel;
}

function getEnvLogLevel(): LogLevel | undefined {
  if (process.env.DOGU_LOG_LEVEL && LogLevel.includes(process.env.DOGU_LOG_LEVEL as LogLevel)) {
    return process.env.DOGU_LOG_LEVEL as LogLevel;
  }
  return undefined;
}

function getRunTypeLogLevel(runType: DoguRunType): LogLevel {
  if (runType === 'production' || runType === 'self-hosted') {
    return 'info';
  }
  return 'verbose';
}

export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9]{1,2}m/g, '');
}
