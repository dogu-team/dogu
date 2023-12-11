export const Jdk = 'jdk';
export const AndroidSdk = 'android-sdk';
export const Appium = 'appium';
export const AppiumUiAutomator2Driver = 'appium-uiautomator2-driver';
export const Xcode = 'xcode';
export const AppiumXcuitestDriver = 'appium-xcuitest-driver';
export const WebDriverAgentBuild = 'web-driver-agent-build';
export const IosDeviceAgentBuild = 'ios-device-agent-build';
export const LibiMobileDevice = 'libimobiledevice';
export const SeleniumServer = 'selenium-server';
export const GeckoDriver = 'gecko-driver';

export const ExternalKey = [
  Jdk,
  AndroidSdk,
  Appium,
  AppiumUiAutomator2Driver,
  Xcode,
  AppiumXcuitestDriver,
  WebDriverAgentBuild,
  IosDeviceAgentBuild,
  LibiMobileDevice,
  SeleniumServer,
  GeckoDriver,
] as const;
export type ExternalKey = (typeof ExternalKey)[number];
export const IosSettingsExternalKey = [Xcode, WebDriverAgentBuild, IosDeviceAgentBuild] as const;

export interface ExternalValidationResult {
  valid: boolean;
  error: Error | null;
}

export interface ValidationCheckOption {
  ignoreManual: boolean;
}

export interface DownloadProgress {
  percent: number;
  transferredBytes: number;
  totalBytes: number;
}
