import { LatestBrowserVersionResolver, LatestBrowserVersionResolverOptions, LatestBrowserVersionResolverResult } from '@dogu-tech/device-client-common';
import { chromeVersionLikeToString, downloadLastKnownGoodChromeVersionLike } from './chrome-version-provider';

export class ChromeLatestBrowserVersionResolver implements LatestBrowserVersionResolver {
  match(options: LatestBrowserVersionResolverOptions): boolean {
    return options.browserName === 'chrome';
  }

  async resolve(options: LatestBrowserVersionResolverOptions): Promise<LatestBrowserVersionResolverResult> {
    const chromeVersionLike = await downloadLastKnownGoodChromeVersionLike();
    const browserVersion = chromeVersionLikeToString(chromeVersionLike);
    return { browserVersion };
  }
}
