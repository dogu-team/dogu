export const BrowserName = ['chrome', 'chromium', 'firefox', 'safari', 'webkit', 'edge', 'ie'] as const;
export type BrowserName = (typeof BrowserName)[number];

export function isValidBrowserName(value: string): value is BrowserName {
  return BrowserName.includes(value as BrowserName);
}

export const BrowserDriverName = ['chromedriver', 'geckodriver', 'safaridriver'] as const;
export type BrowserDriverName = (typeof BrowserDriverName)[number];

export function isValidBrowserDriverName(value: string): value is BrowserDriverName {
  return BrowserDriverName.includes(value as BrowserDriverName);
}

export type BrowserOrDriverName = BrowserName | BrowserDriverName;
