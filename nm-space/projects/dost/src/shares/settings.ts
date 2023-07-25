import { instanceKeys } from './electron-ipc';

export const settingsClientKey = instanceKeys<ISettingsClient>('settingsClient');

export interface ILoginItemSettingsOptions {
  path?: string;
  args?: string[];
}

export interface ILoginItemSettings {
  openAtLogin: boolean;
  openAsHidden: boolean;
  wasOpenedAtLogin: boolean;
  wasOpenedAsHidden: boolean;
  restoreState: boolean;
  executableWillLaunchAtLogin: boolean;
}

export interface ISettings {
  openAtLogin?: boolean;
  openAsHidden?: boolean;
  path?: string;
  args?: string[];
  enabled?: boolean;
  name?: string;
}

export type MediaType = 'microphone' | 'camera' | 'screen';
export type AskMediaType = 'microphone' | 'camera';
export type MediaAccessStatus = 'not-determined' | 'granted' | 'denied' | 'restricted' | 'unknown';

export type Platform = 'win32' | 'darwin' | 'linux';
export interface ISettingsClient {
  //https://www.electronjs.org/docs/latest/api/app#appgetloginitemsettingsoptions-macos-windows
  isDev(): Promise<boolean>;
  isShowDevUI(): Promise<boolean>;

  getLoginItemSettings(option: ILoginItemSettingsOptions): Promise<ILoginItemSettings>;
  setLoginItemSettings(setting: ISettings): Promise<void>;
  setSecureKeyboardEntryEnabled(enabled: boolean): Promise<void>;
  openJsonConfig(): Promise<void>;
  openWritableDirectory(): Promise<void>;
  openExternal(url: string): Promise<void>;

  getPlatform(): Promise<Platform>;

  // media
  getMediaAccessStatus(mediaType: MediaType): Promise<MediaAccessStatus>;
  requestDesktopCapture(): Promise<void>;
  isTrustedAccessibilityClient(prompt: boolean): Promise<boolean>;
  openSecurityPrefPanel(name: string): Promise<void>;

  // app
  setBadgeCount(count: number): Promise<void>;

  // path-map
  getDefaultAndroidHomePath(): Promise<string>;
  getDefaultJavaHomePath(): Promise<string>;
  getDefaultAppiumHomePath(): Promise<string>;

  // appium
  openWdaProject(): Promise<void>;

  openIdaProject(): Promise<void>;
}
