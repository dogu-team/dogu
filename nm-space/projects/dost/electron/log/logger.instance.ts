import { DoguRunType } from '@dogu-private/env-tools';
import { LogLevel } from '@dogu-tech/common';
import { LoggerFactory } from '@dogu-tech/node';
import { AppConfigService } from '../app-config/app-config-service';

export const logger = LoggerFactory.createLazy('main');
export const rendererLogger = LoggerFactory.createLazy('renderer');

/*
 * DOGU_LOG_LEVEL
 * Priority: config > env > runType
 */
export async function getLogLevel(runType: DoguRunType, configService: AppConfigService): Promise<LogLevel> {
  let currentLogLevel = getRunTypeLogLevel(runType);
  const envLogLevel = getEnvLogLevel();
  if (envLogLevel) {
    currentLogLevel = envLogLevel;
  }
  const configLogLevel = await configService.getOrDefault('DOGU_LOG_LEVEL', currentLogLevel);
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
