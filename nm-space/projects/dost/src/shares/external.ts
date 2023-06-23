import { IpcRendererEvent } from 'electron';
import { DotEnvConfigKey } from './dot-env-config';
import { instanceKeys } from './electron-ipc';

export const externalKey = instanceKeys<IExternalClient>('externalClient');

export const JdkKey = 'jdk';
export const AndroidSdkKey = 'android-sdk';
export const AppiumKey = 'appium';
export const AppiumUiAutomator2DriverKey = 'appium-uiautomator2-driver';
export const XcodeKey = 'xcode';
export const AppiumXcuitestDriverKey = 'appium-xcuitest-driver';
export const WebDriverAgentBuild = 'web-driver-agent-build';
export const IosDeviceAgentBuild = 'ios-device-agent-build';

export const ExternalKey = [JdkKey, AndroidSdkKey, AppiumKey, AppiumUiAutomator2DriverKey, XcodeKey, AppiumXcuitestDriverKey, WebDriverAgentBuild, IosDeviceAgentBuild] as const;
export type ExternalKey = (typeof ExternalKey)[number];

export const ExternalKeysProvidedByDost = [JdkKey, AndroidSdkKey, AppiumUiAutomator2DriverKey, AppiumXcuitestDriverKey] as const;
export type ExternalKeysProvidedByDost = (typeof ExternalKeysProvidedByDost)[number];

export const ExternalKeyAndNames: Record<ExternalKeysProvidedByDost, string> = {
  jdk: 'OpenJDK',
  'android-sdk': 'Android SDK',
  'appium-uiautomator2-driver': 'Appium UiAutomator2 Driver',
  'appium-xcuitest-driver': 'Appium XCUITest Driver',
};

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
  getEnvKeys(key: ExternalKey): Promise<DotEnvConfigKey[]>;
  getEnvValue(key: ExternalKey, envKey: DotEnvConfigKey): Promise<string>;
  writeEnvValue(key: ExternalKey, envKey: DotEnvConfigKey, value: string): Promise<void>;
  getLastValidationResult(key: ExternalKey): Promise<ExternalValidationResult | null>;
  isAgreementNeeded(key: ExternalKey): Promise<boolean>;
  writeAgreement(key: ExternalKey, value: boolean): Promise<void>;
  isInstallNeeded(key: ExternalKey): Promise<boolean>;
  isManualInstallNeeded(key: ExternalKey): Promise<boolean>;
  install(key: ExternalKey): Promise<void>;
  cancelInstall(key: ExternalKey): Promise<void>;
  validate(key: ExternalKey): Promise<ExternalValidationResult>;
  isValid(key: ExternalKey): Promise<boolean>;
  isSupportedPlatformValidationCompleted(): Promise<boolean>;
  isSupportedPlatformValid(option: ValidationCheckOption): Promise<boolean>;
  getSupportedPlatformKeys(): Promise<ExternalKey[]>;
  getTermUrl(key: ExternalKey): Promise<string | null>;
}

export const externalCallbackKey = instanceKeys<IExternalCallback>('externalCallback');

export interface DownloadProgress {
  percent: number;
  transferredBytes: number;
  totalBytes: number;
}

export interface IExternalCallback {
  onDownloadStarted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
  onDownloadInProgress: (callback: (event: IpcRendererEvent, key: ExternalKey, progress: DownloadProgress) => void) => void;
  onDownloadCompleted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
  onInstallStarted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
  onInstallCompleted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => void;
}
