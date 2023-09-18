import { DotenvConfigKey, DownloadProgress } from '@dogu-private/dogu-agent-core';
import { IpcRendererEvent } from 'electron';
import { instanceKeys } from './electron-ipc';

export const externalKey = instanceKeys<IExternalClient>('externalClient');

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

export interface IExternalClient {
  getKeys(): Promise<ExternalKey[]>;
  isPlatformSupported(key: ExternalKey): Promise<boolean>;
  getName(key: ExternalKey): Promise<string>;
  getEnvKeys(key: ExternalKey): Promise<DotenvConfigKey[]>;
  getEnvValue(key: ExternalKey, envKey: DotenvConfigKey): Promise<string>;
  writeEnvValue(key: ExternalKey, envKey: DotenvConfigKey, value: string): Promise<void>;
  getLastValidationResult(key: ExternalKey): Promise<ExternalValidationResult | null>;
  isAgreementNeeded(key: ExternalKey): Promise<boolean>;
  writeAgreement(key: ExternalKey, value: boolean): Promise<void>;
  isInstallNeeded(key: ExternalKey): Promise<boolean>;
  isManualInstallNeeded(key: ExternalKey): Promise<boolean>;
  install(key: ExternalKey): Promise<void>;
  uninstall(key: ExternalKey): Promise<void>;
  cancelInstall(key: ExternalKey): Promise<void>;
  validate(key: ExternalKey): Promise<ExternalValidationResult>;
  isValid(key: ExternalKey): Promise<ExternalValidationResult>;
  isSupportedPlatformValidationCompleted(): Promise<boolean>;
  isSupportedPlatformValid(option: ValidationCheckOption): Promise<boolean>;
  isSupportedPlatformAgreementNeeded(option: ValidationCheckOption): Promise<boolean>;
  getSupportedPlatformKeys(): Promise<ExternalKey[]>;
  getTermUrl(key: ExternalKey): Promise<string | null>;
}

export const externalCallbackKey = instanceKeys<IExternalCallback>('externalCallback');

export interface IExternalCallback {
  onDownloadStarted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
  onDownloadInProgress: (callback: (event: IpcRendererEvent, key: ExternalKey, progress: DownloadProgress) => void) => void;
  onDownloadCompleted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
  onInstallStarted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
  onInstallCompleted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
}
