import { getBrowserNamesByPlatform } from '@dogu-private/types';
import { assertUnreachable, errorify, PrefixLogger, stringify } from '@dogu-tech/common';
import {
  EnsureBrowserAndDriverOptions,
  EnsureBrowserAndDriverResult,
  FindAllBrowserInstallationsOptions,
  FindAllBrowserInstallationsResult,
} from '@dogu-tech/device-client-common';
import { logger } from '../logger/logger.instance';
import { Chrome } from './chrome';
import { Firefox } from './firefox';

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly chrome = new Chrome();
  private readonly firefox = new Firefox();

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    const { browserName, browserVersion } = options;
    switch (browserName) {
      case 'chrome':
        return this.ensureBrowserAndDriverChrome(options);
      case 'firefox':
      case 'firefox-devedition':
        return this.ensureBrowserAndDriverFirefox(options);
    }

    assertUnreachable(browserName);
  }

  private async ensureBrowserAndDriverChrome(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {}

  private async ensureBrowserAndDriverFirefox(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {}
}
