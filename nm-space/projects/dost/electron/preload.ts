import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { appConfigClientKey } from '../src/shares/app-config';
import { childCallbackKey, childClientKey, ChildTree, HostAgentConnectionStatus, Key } from '../src/shares/child';
import { deviceLookupClientKey } from '../src/shares/device-lookup';
import { dotEnvConfigClientKey, DotEnvConfigKey } from '../src/shares/dot-env-config';
import { IElectronIpc } from '../src/shares/electron-ipc';
import { DownloadProgress, externalCallbackKey, ExternalKey, externalKey, ValidationCheckOption } from '../src/shares/external';
import { featureConfigClientKey, FeatureKey } from '../src/shares/feature-config';
import { rendererLoggerKey, stdLogCallbackKey } from '../src/shares/log';
import { servicesOpenStatusClientKey } from '../src/shares/services-open-status';
import { ILoginItemSettingsOptions, ISettings, MediaType, settingsClientKey } from '../src/shares/settings';
import { themeClientKey } from '../src/shares/theme';
import { updaterClientKey } from '../src/shares/updater';
import { windowClientKey } from '../src/shares/window';

type IpcKey = keyof IElectronIpc;
type IpcValue<IpcKey extends keyof IElectronIpc> = IElectronIpc[IpcKey];

function expose<Key extends IpcKey>(name: Key, value: IpcValue<Key>) {
  contextBridge.exposeInMainWorld(name, value);
}

expose('themeClient', { shouldUseDarkColors: () => ipcRenderer.invoke(themeClientKey.shouldUseDarkColors) });

expose('appConfigClient', {
  getOrDefault: (key: string, value: any): Promise<any> => ipcRenderer.invoke(appConfigClientKey.getOrDefault, key, value),
  get: (key: string): Promise<any> => ipcRenderer.invoke(appConfigClientKey.get, key),
  set: (key: string, value: any): Promise<void> => ipcRenderer.invoke(appConfigClientKey.set, key, value),
  delete: (key: string): Promise<void> => ipcRenderer.invoke(appConfigClientKey.delete, key),
});

expose('settingsClient', {
  isDev: () => ipcRenderer.invoke(settingsClientKey.isDev),
  isShowDevUI: () => ipcRenderer.invoke(settingsClientKey.isShowDevUI),
  getLoginItemSettings: (option: ILoginItemSettingsOptions) => ipcRenderer.invoke(settingsClientKey.getLoginItemSettings, option),
  setLoginItemSettings: (setting: ISettings) => ipcRenderer.invoke(settingsClientKey.setLoginItemSettings, setting),
  setSecureKeyboardEntryEnabled: (enabled: boolean) => ipcRenderer.invoke(settingsClientKey.setSecureKeyboardEntryEnabled, enabled),
  openJsonConfig: () => ipcRenderer.invoke(settingsClientKey.openJsonConfig),
  openWritableDirectory: () => ipcRenderer.invoke(settingsClientKey.openWritableDirectory),
  openExternal: (url: string) => ipcRenderer.invoke(settingsClientKey.openExternal, url),

  getPlatform: () => ipcRenderer.invoke(settingsClientKey.getPlatform),

  getMediaAccessStatus: (mediaType: MediaType) => ipcRenderer.invoke(settingsClientKey.getMediaAccessStatus, mediaType),
  requestDesktopCapture: () => ipcRenderer.invoke(settingsClientKey.requestDesktopCapture),
  isTrustedAccessibilityClient: (prompt: boolean) => ipcRenderer.invoke(settingsClientKey.isTrustedAccessibilityClient, prompt),
  openSecurityPrefPanel: (name: string) => ipcRenderer.invoke(settingsClientKey.openSecurityPrefPanel, name),

  setBadgeCount: (count: number) => ipcRenderer.invoke(settingsClientKey.setBadgeCount, count),
  restart: () => ipcRenderer.invoke(settingsClientKey.restart),

  getDefaultAndroidHomePath: () => ipcRenderer.invoke(settingsClientKey.getDefaultAndroidHomePath),
  getDefaultJavaHomePath: () => ipcRenderer.invoke(settingsClientKey.getDefaultJavaHomePath),
  getDefaultAppiumHomePath: () => ipcRenderer.invoke(settingsClientKey.getDefaultAppiumHomePath),

  openWdaProject: () => ipcRenderer.invoke(settingsClientKey.openWdaProject),
  openIdaProject: () => ipcRenderer.invoke(settingsClientKey.openIdaProject),

  changeStrictSSLOnNPMLikes: (strictSSL: boolean) => ipcRenderer.invoke(settingsClientKey.changeStrictSSLOnNPMLikes, strictSSL),
  createZipLogReport: () => ipcRenderer.invoke(settingsClientKey.createZipLogReport),
  writeTextToClipboard: (text: string) => ipcRenderer.invoke(settingsClientKey.writeTextToClipboard, text),
});

expose('childClient', {
  isActive: (key: Key): Promise<boolean> => ipcRenderer.invoke(childClientKey.isActive, key),
  connect: (token: string): Promise<HostAgentConnectionStatus> => ipcRenderer.invoke(childClientKey.connect, token),
  getHostAgentConnectionStatus: (): Promise<HostAgentConnectionStatus> => ipcRenderer.invoke(childClientKey.getHostAgentConnectionStatus),
  getChildTree: (): Promise<ChildTree> => ipcRenderer.invoke(childClientKey.getChildTree),
});

expose('childCallback', {
  onSpawn: (callback: (event: IpcRendererEvent, key: Key) => void) => ipcRenderer.on(childCallbackKey.onSpawn, callback),
  onError: (callback: (event: IpcRendererEvent, key: Key, error: Error) => void) => ipcRenderer.on(childCallbackKey.onError, callback),
  onClose: (callback: (event: IpcRendererEvent, key: Key, code: number, signal: string) => void) => ipcRenderer.on(childCallbackKey.onClose, callback),
});

expose('rendererLogger', {
  error: (message: unknown, details?: Record<string, unknown>) => ipcRenderer.send(rendererLoggerKey.error, message, details),
  warn: (message: unknown, details?: Record<string, unknown>) => ipcRenderer.send(rendererLoggerKey.warn, message, details),
  info: (message: unknown, details?: Record<string, unknown>) => ipcRenderer.send(rendererLoggerKey.info, message, details),
  debug: (message: unknown, details?: Record<string, unknown>) => ipcRenderer.send(rendererLoggerKey.debug, message, details),
  verbose: (message: unknown, details?: Record<string, unknown>) => ipcRenderer.send(rendererLoggerKey.verbose, message, details),
});

expose('stdLogCallback', {
  onStdout: (callback: (event: IpcRendererEvent, message: string) => void) => ipcRenderer.on(stdLogCallbackKey.onStdout, callback),
  onStderr: (callback: (event: IpcRendererEvent, message: string) => void) => ipcRenderer.on(stdLogCallbackKey.onStderr, callback),
});

expose('updaterClient', {
  getAppVersion: () => ipcRenderer.invoke(updaterClientKey.getAppVersion),
  checkForUpdates: () => ipcRenderer.invoke(updaterClientKey.checkForUpdates),
  downloadAndInstallUpdate: () => ipcRenderer.invoke(updaterClientKey.downloadAndInstallUpdate),
});

expose('dotEnvConfigClient', {
  load: () => ipcRenderer.invoke(dotEnvConfigClientKey.load),
  set: (key: DotEnvConfigKey, value: string) => ipcRenderer.invoke(dotEnvConfigClientKey.set, key, value),
  get: (key: DotEnvConfigKey) => ipcRenderer.invoke(dotEnvConfigClientKey.get, key),
  getDotEnvConfigPath: () => ipcRenderer.invoke(dotEnvConfigClientKey.getDotEnvConfigPath),
});

expose('externalClient', {
  getKeys: () => ipcRenderer.invoke(externalKey.getKeys),
  isPlatformSupported: (key: ExternalKey) => ipcRenderer.invoke(externalKey.isPlatformSupported, key),
  getName: (key: ExternalKey) => ipcRenderer.invoke(externalKey.getName, key),
  getEnvKeys: (key: ExternalKey) => ipcRenderer.invoke(externalKey.getEnvKeys, key),
  getEnvValue: (key: ExternalKey, dotEnvConfigKey: DotEnvConfigKey) => ipcRenderer.invoke(externalKey.getEnvValue, key, dotEnvConfigKey),
  writeEnvValue: (key: ExternalKey, dotEnvConfigKey: DotEnvConfigKey, value: string) => ipcRenderer.invoke(externalKey.writeEnvValue, key, dotEnvConfigKey, value),
  getLastValidationResult: (key: ExternalKey) => ipcRenderer.invoke(externalKey.getLastValidationResult, key),
  isAgreementNeeded: (key: ExternalKey) => ipcRenderer.invoke(externalKey.isAgreementNeeded, key),
  writeAgreement: (key: ExternalKey, value: boolean) => ipcRenderer.invoke(externalKey.writeAgreement, key, value),
  isInstallNeeded: (key: ExternalKey) => ipcRenderer.invoke(externalKey.isInstallNeeded, key),
  isManualInstallNeeded: (key: ExternalKey) => ipcRenderer.invoke(externalKey.isManualInstallNeeded, key),
  install: (key: ExternalKey) => ipcRenderer.invoke(externalKey.install, key),
  uninstall: (key: ExternalKey) => ipcRenderer.invoke(externalKey.uninstall, key),
  cancelInstall: (key: ExternalKey) => ipcRenderer.invoke(externalKey.cancelInstall, key),
  validate: (key: ExternalKey) => ipcRenderer.invoke(externalKey.validate, key),
  isValid: (key: ExternalKey) => ipcRenderer.invoke(externalKey.isValid, key),
  isSupportedPlatformValidationCompleted: () => ipcRenderer.invoke(externalKey.isSupportedPlatformValidationCompleted),
  isSupportedPlatformValid: (option: ValidationCheckOption) => ipcRenderer.invoke(externalKey.isSupportedPlatformValid, option),
  isSupportedPlatformAgreementNeeded: (option: ValidationCheckOption) => ipcRenderer.invoke(externalKey.isSupportedPlatformAgreementNeeded, option),
  getSupportedPlatformKeys: () => ipcRenderer.invoke(externalKey.getSupportedPlatformKeys),
  getTermUrl: (key: ExternalKey) => ipcRenderer.invoke(externalKey.getTermUrl, key),
});

expose('externalCallback', {
  onDownloadStarted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => ipcRenderer.on(externalCallbackKey.onDownloadStarted, callback),
  onDownloadInProgress: (callback: (event: IpcRendererEvent, key: ExternalKey, progress: DownloadProgress) => void) =>
    ipcRenderer.on(externalCallbackKey.onDownloadInProgress, callback),
  onDownloadCompleted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => ipcRenderer.on(externalCallbackKey.onDownloadCompleted, callback),
  onInstallStarted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => ipcRenderer.on(externalCallbackKey.onInstallStarted, callback),
  onInstallCompleted: (callback: (event: IpcRendererEvent, key: ExternalKey) => void) => ipcRenderer.on(externalCallbackKey.onInstallCompleted, callback),
});

expose('windowClient', {
  minimize: () => ipcRenderer.invoke(windowClientKey.minimize),
  maximize: () => ipcRenderer.invoke(windowClientKey.maximize),
  unmaximize: () => ipcRenderer.invoke(windowClientKey.unmaximize),
  close: () => ipcRenderer.invoke(windowClientKey.close),
  onMaximize: (callback: () => void) => ipcRenderer.on(windowClientKey.onMaximize, callback),
  onUnmaximize: (callback: () => void) => ipcRenderer.on(windowClientKey.onUnmaximize, callback),
});

expose('featureConfigClient', {
  get: (key: FeatureKey) => ipcRenderer.invoke(featureConfigClientKey.get, key),
});

expose('deviceLookupClient', {
  getSubscribeMessages: () => ipcRenderer.invoke(deviceLookupClientKey.getSubscribeMessages),
});

expose('servicesOpenStatusClient', {
  isServicesOpened: () => ipcRenderer.invoke(servicesOpenStatusClientKey.isServicesOpened),
});
