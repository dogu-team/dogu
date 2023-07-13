export const BrowserName = ['chrome', 'chromium', 'firefox', 'safari', 'webkit', 'edge', 'ie'] as const;
export type BrowserName = (typeof BrowserName)[number];

export function isValidBrowserName(value: string): value is BrowserName {
  return BrowserName.includes(value as BrowserName);
}
