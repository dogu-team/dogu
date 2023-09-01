import { LatestBrowserVersionResolver, LatestBrowserVersionResolverOptions, LatestBrowserVersionResolverResult } from './browser-manager.types';
import { FirefoxBrowserVersionProvider, firefoxBrowserVersionUtils } from './firefox-browser-version';

export class FirefoxBrowserVersionProviderLatestBrowserVersionResolver implements LatestBrowserVersionResolver {
  constructor(private readonly firefoxBrowserVersionProvider: FirefoxBrowserVersionProvider) {}

  match(options: LatestBrowserVersionResolverOptions): boolean {
    return options.browserName === 'firefox' && options.browserVersion === 'latest';
  }

  async resolve(options: LatestBrowserVersionResolverOptions): Promise<LatestBrowserVersionResolverResult> {
    const latest = await this.firefoxBrowserVersionProvider.latest();
    const browserVersion = firefoxBrowserVersionUtils.toString(latest);
    return { ...options, browserVersion };
  }
}
