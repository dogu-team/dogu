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
export const isAllowedBrowserPlatform = (value: string): value is BrowserPlatform => BrowserPlatform.includes(value as BrowserPlatform);

export const MacosBrowserName = ['chrome', 'firefox', 'safari', 'safaritp', 'edge'] as const;
export type MacosBrowserName = (typeof MacosBrowserName)[number] extends Extract<BrowserName, 'chrome' | 'firefox' | 'safari' | 'safaritp' | 'edge'>
  ? (typeof MacosBrowserName)[number]
  : never;
export const isAllowedMacosBrowserName = (value: string): value is MacosBrowserName => MacosBrowserName.includes(value as MacosBrowserName);

export const WindowsBrowserName = ['chrome', 'firefox', 'edge', 'iexplorer'] as const;
export type WindowsBrowserName = (typeof WindowsBrowserName)[number] extends Extract<BrowserName, 'chrome' | 'firefox' | 'edge' | 'iexplorer'>
  ? (typeof WindowsBrowserName)[number]
  : never;
export const isAllowedWindowsBrowserName = (value: string): value is WindowsBrowserName => WindowsBrowserName.includes(value as WindowsBrowserName);

export const AndroidBrowserName = ['chrome', 'firefox', 'edge', 'samsung-internet'] as const;
export type AndroidBrowserName = (typeof AndroidBrowserName)[number] extends Extract<BrowserName, 'chrome' | 'firefox' | 'edge' | 'samsung-internet'>
  ? (typeof AndroidBrowserName)[number]
  : never;
export const isAllowedAndroidBrowserName = (value: string): value is AndroidBrowserName => AndroidBrowserName.includes(value as AndroidBrowserName);
export const AndroidBrowserPackageNameMap: Record<AndroidBrowserName, string> = {
  chrome: 'com.android.chrome',
  firefox: 'org.mozilla.firefox',
  edge: 'com.microsoft.emmx',
  'samsung-internet': 'com.sec.android.app.sbrowser',
} as const;
export type AndroidBrowserPackageName = keyof typeof AndroidBrowserPackageNameMap;

export const IosBrowserName = ['chrome', 'firefox', 'safari', 'edge'] as const;
export type IosBrowserName = (typeof IosBrowserName)[number] extends Extract<BrowserName, 'chrome' | 'firefox' | 'safari' | 'edge'> ? (typeof IosBrowserName)[number] : never;
export const isAllowedIosBrowserName = (value: string): value is IosBrowserName => IosBrowserName.includes(value as IosBrowserName);
export const IosBrowserPackageNameMap: Record<IosBrowserName, string> = {
  chrome: 'com.google.chrome.ios',
  firefox: 'org.mozilla.iosfirefox',
  edge: 'com.microsoft.edge.ios',
  safari: 'com.apple.mobilesafari',
} as const;
export type IosBrowserPackageName = keyof typeof IosBrowserPackageNameMap;

export function isAllowedBrowserNameForPlatform(browserName: BrowserName, platform: BrowserPlatform): boolean {
  switch (platform) {
    case 'macos':
      return isAllowedMacosBrowserName(browserName);
    case 'windows':
      return isAllowedWindowsBrowserName(browserName);
    case 'android':
      return isAllowedAndroidBrowserName(browserName);
    case 'ios':
      return isAllowedIosBrowserName(browserName);
    default:
      const _exhaustiveCheck: never = platform;
      throw new Error(`Invalid platform [${platform}]`);
  }
}

export function getBrowserNamesByPlatform(browserPlatform: BrowserPlatform): BrowserName[] {
  switch (browserPlatform) {
    case 'macos':
      return MacosBrowserName as unknown as BrowserName[];
    case 'windows':
      return WindowsBrowserName as unknown as BrowserName[];
    case 'android':
      return AndroidBrowserName as unknown as BrowserName[];
    case 'ios':
      return IosBrowserName as unknown as BrowserName[];
    default:
      const _exhaustiveCheck: never = browserPlatform;
      throw new Error(`Invalid platform [${browserPlatform}]`);
  }
}
