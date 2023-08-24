import { PlatformType } from './platforms';

export const BrowserName = ['chrome', 'firefox', 'safari', 'safaritp', 'edge', 'iexplorer', 'samsung-internet'] as const;
export type BrowserName = (typeof BrowserName)[number];
export const isAllowedBrowserName = (value: string): value is BrowserName => BrowserName.includes(value as BrowserName);

export const DriverName = ['chromedriver', 'geckodriver', 'safaridriver', 'msedgedriver', 'IEDriverServer'] as const;
export type DriverName = (typeof DriverName)[number];
export const isAllowedDriverName = (value: string): value is DriverName => DriverName.includes(value as DriverName);

export type BrowserOrDriverName = BrowserName | DriverName;

export const BrowserPlatform = ['macos', 'windows', 'android', 'ios'] as const;
export type BrowserPlatform = (typeof BrowserPlatform)[number] extends Extract<PlatformType, 'macos' | 'windows' | 'android' | 'ios'> ? (typeof BrowserPlatform)[number] : never;

export type MacosBrowserName = Extract<BrowserName, 'chrome' | 'firefox' | 'safari' | 'safaritp' | 'edge'>;
export type WindowsBrowserName = Extract<BrowserName, 'chrome' | 'firefox' | 'edge' | 'iexplorer'>;

export type AndroidBrowserName = Extract<BrowserName, 'chrome' | 'firefox' | 'edge' | 'samsung-internet'>;
export const AndroidBrowserAppIdMap: Record<AndroidBrowserName, string> = {
  chrome: 'com.android.chrome',
  firefox: 'org.mozilla.firefox',
  edge: 'com.microsoft.emmx',
  'samsung-internet': 'com.sec.android.app.sbrowser',
} as const;
export type AndroidBrowserAppId = keyof typeof AndroidBrowserAppIdMap;

export type IosBrowserName = Extract<BrowserName, 'chrome' | 'firefox' | 'safari' | 'edge'>;
export const IosBrowserAppIdMap: Record<IosBrowserName, string> = {
  chrome: 'com.google.chrome.ios',
  firefox: 'org.mozilla.iosfirefox',
  edge: 'com.microsoft.edge.ios',
  safari: 'com.apple.mobilesafari',
} as const;
export type IosBrowserAppId = keyof typeof IosBrowserAppIdMap;
