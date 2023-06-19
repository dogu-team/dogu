import { Serial } from '@dogu-private/types';
import { Logger, LoggerFactory } from '@dogu-tech/node';

export const logger = LoggerFactory.createLazy('device-server');
export const gdcLogger = LoggerFactory.createLazy('go-device-controller');
export const idcLogger = LoggerFactory.createLazy('ios-device-controller');
export const adbLogger = LoggerFactory.createLazy('adb', { withConsoleTransport: false });

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
