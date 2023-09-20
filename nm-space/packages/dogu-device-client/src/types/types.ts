export type DeviceId = string;
export type Serial = string;

export const BrowserName = ['chrome', 'firefox', 'firefox-devedition', 'safari', 'safaritp', 'edge', 'iexplorer', 'samsung-internet'] as const;
export type BrowserName = (typeof BrowserName)[number];
export const isAllowedBrowserName = (value: string): value is BrowserName => BrowserName.includes(value as BrowserName);

export const BrowserPlatform = ['macos', 'windows', 'linux', 'android', 'ios'] as const;
export type BrowserPlatform = (typeof BrowserPlatform)[number];
export const isAllowedBrowserPlatform = (value: string): value is BrowserPlatform => BrowserPlatform.includes(value as BrowserPlatform);

export interface EnsureBrowserAndDriverOptions {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  browserVersion?: string;
  deviceSerial?: Serial;
}

export interface EnsureBrowserAndDriverResult {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  browserVersion: string;
  browserMajorVersion: number;
  browserDriverVersion: string;
  browserDriverPath: string;
  browserPath?: string;
  browserPackageName?: string;
  deviceSerial?: Serial;
}
