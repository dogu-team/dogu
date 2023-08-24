import { LatestBrowserVersionResolver, LatestBrowserVersionResolverOptions, ResolvedBrowserVersionInfo } from './browser-manager.types';
import { chromeVersionLikeToString, downloadLastKnownGoodChromeVersionLike } from './chrome-version-utils';

export class ChromeLatestBrowserVersionResolver implements LatestBrowserVersionResolver {
  match(options: LatestBrowserVersionResolverOptions): boolean {
    return options.browserName === 'chrome';
  }

  async resolve(): Promise<ResolvedBrowserVersionInfo> {
    const chromeVersionLike = await downloadLastKnownGoodChromeVersionLike();
    const browserVersion = chromeVersionLikeToString(chromeVersionLike);
    return { browserVersion };
  }
}
