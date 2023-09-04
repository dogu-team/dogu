import { assertUnreachable, PrefixLogger } from '@dogu-tech/common';
import {
  EnsureBrowserAndDriverOptions,
  EnsureBrowserAndDriverResult,
  FindAllBrowserInstallationsOptions,
  FindAllBrowserInstallationsResult,
} from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { logger } from '../logger/logger.instance';
import { Chrome } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { Firefox } from './firefox';

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly chrome = new Chrome();
  private readonly firefox = new Firefox();
  private readonly rootPath = HostPaths.external.browser.browsersPath();

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    const { browserName, browserVersion } = options;
    switch (browserName) {
      case 'chrome':
        {
        }
        break;
      case 'firefox':
      case 'firefox-devedition':
        {
        }
        break;
      default:
        assertUnreachable(browserName);
    }
  }

  async findBrowserInstallations(options: FindAllBrowserInstallationsOptions): Promise<FindAllBrowserInstallationsResult> {
    const { browserName, browserPlatform, deviceSerial } = options;
    switch (browserName) {
      case 'chrome':
        {
          switch (browserPlatform) {
            case 'macos':
            case 'windows': {
              const platform = browserPlatform === 'macos' ? 'darwin' : 'win32';
              const chromePlatform = this.chrome.getChromePlatform({ platform, arch: process.arch });
              const installations = await this.chrome.findInstallations({ installableName: browserName, rootPath: this.rootPath, platform: chromePlatform });
              const browserInstallations = installations.map((installation) => ({
                browserName,
                browserPlatform,
                browserVersion: installation.version,
                browserMajorVersion: chromeVersionUtils.parse(installation.version).major,
                browserPath: installation.executablePath,
              }));
              return { browserInstallations };
            }
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      default:
        assertUnreachable(browserName);
    }
  }
}
