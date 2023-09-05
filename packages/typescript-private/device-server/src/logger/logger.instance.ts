import { Platform, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { Logger, LoggerFactory } from '@dogu-tech/node';

export const logger = LoggerFactory.createLazy('device-server');
export const idcLogger = LoggerFactory.createLazy('ios-device-controller');
export const adbLogger = LoggerFactory.createLazy('adb', { withConsoleTransport: false });

export function createGdcLogger(platform: Platform): Logger {
  return LoggerFactory.createLazy(`gdc_${platformTypeFromPlatform(platform)}`, { withFileTransports: true });
}

export function createAdaLogger(serial: Serial): Logger {
  return LoggerFactory.createLazy(`ada_${serial}`, { withFileTransports: true });
}

export function createIdaLogger(serial: Serial): Logger {
  return LoggerFactory.createLazy(`ida_${serial}`, { withFileTransports: true });
}

export function createAppiumLogger(serial: Serial): Logger {
  return LoggerFactory.createLazy(`appium_${serial}`, { withFileTransports: true });
}

export function createGamiumLogger(serial: Serial): Logger {
  return LoggerFactory.createLazy(`gamium_${serial}`, { withFileTransports: true });
}
