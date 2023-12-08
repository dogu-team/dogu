import { handleLoggerCreateWithSentry } from '@dogu-private/nestjs-common';
import { Serial } from '@dogu-private/types';
import { Logger, LoggerFactory } from '@dogu-tech/node';
import { env } from '../env';

export const logger = LoggerFactory.createLazy('device-server');
export const zombieLogger = LoggerFactory.createLazy('zombie', { withFileTransports: true });
export const adbLogger = LoggerFactory.createLazy('adb', { withConsoleTransport: false });
export const deviceInfoLogger = LoggerFactory.createLazy('device-info', { withFileTransports: true });

export function createAppiumLogger(serial: Serial): Logger {
  const ret = LoggerFactory.createLazy(`${serial}_appium`, { withFileTransports: true });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, ret);
  return ret;
}

export function createGamiumLogger(serial: Serial): Logger {
  const ret = LoggerFactory.createLazy(`${serial}_gamium`, { withFileTransports: true });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, ret);
  return ret;
}
