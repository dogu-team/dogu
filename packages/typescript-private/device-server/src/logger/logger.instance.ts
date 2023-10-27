import { Platform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { Logger, LoggerFactory } from '@dogu-tech/node';

export const logger = LoggerFactory.createLazy('device-server');
export const zombieLogger = LoggerFactory.createLazy('zombie', { withFileTransports: true });
export const adbLogger = LoggerFactory.createLazy('adb', { withConsoleTransport: false });
export const deviceInfoLogger = LoggerFactory.createLazy('device-info', { withFileTransports: true });

export function createGdcLogger(platform: Platform): Logger {
  return LoggerFactory.createLazy(`gdc_${platformTypeFromPlatform(platform)}`, { withFileTransports: true });
}

export function createAppiumLogger(serial: Serial): Logger {
  return LoggerFactory.createLazy(`${serial}_appium`, { withFileTransports: true });
}

export function createGamiumLogger(serial: Serial): Logger {
  return LoggerFactory.createLazy(`${serial}_gamium`, { withFileTransports: true });
}
