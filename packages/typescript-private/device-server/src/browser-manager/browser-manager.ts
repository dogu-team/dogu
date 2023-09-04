import { BrowserPlatform } from '@dogu-private/types';
import { assertUnreachable, PrefixLogger } from '@dogu-tech/common';
import {
  EnsureBrowserAndDriverOptions,
  EnsureBrowserAndDriverResult,
  FindAllBrowserInstallationsOptions,
  FindAllBrowserInstallationsResult,
} from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { logger } from '../logger/logger.instance';
import { Chrome, ChromePlatform } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { Firefox } from './firefox';

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly chrome = new Chrome();
  private readonly firefox = new Firefox();
  private readonly rootPath = HostPaths.external.browser.browsersPath();

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    const { browserName, browserPlatform, browserVersion, deviceSerial } = options;
    switch (browserName) {
      case 'chrome':
        {
          switch (browserPlatform) {
            case 'macos':
            case 'windows':
              {
                const mappedBrowserVersion = browserVersion ?? 'latest';
                const resolvedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.chrome.getLatestVersion() : mappedBrowserVersion;
                const chromeVersion = chromeVersionUtils.parse(resolvedBrowserVersion);
                const browserMajorVersion = chromeVersion.major;
                const chromePlatform = this.browserPlatformToChromePlatform(browserPlatform);

                const browserFounds = await this.chrome.findInstallations({ installableName: browserName, rootPath: this.rootPath, platform: chromePlatform });
                const browserMatchs = browserFounds.filter(({ majorVersion }) => majorVersion === browserMajorVersion);
                let browserPath = '';
                if (browserMatchs.length > 0) {
                  browserPath = browserMatchs[0].executablePath;
                } else {
                  const browserInstallResult = await this.chrome.install({
                    installableName: browserName,
                    version: resolvedBrowserVersion,
                    rootPath: this.rootPath,
                    platform: chromePlatform,
                  });
                  browserPath = browserInstallResult.executablePath;
                }

                const driverFounds = await this.chrome.findInstallations({ installableName: 'chromedriver', rootPath: this.rootPath, platform: chromePlatform });
                const driverMatchs = driverFounds.filter(({ majorVersion }) => majorVersion === browserMajorVersion);
                let driverPath = '';
                let driverVersion = '';
                if (driverMatchs.length > 0) {
                  const match = driverMatchs[0];
                  driverPath = match.executablePath;
                  driverVersion = match.version;
                } else {
                  const driverInstallResult = await this.chrome.install({
                    installableName: 'chromedriver',
                    version: resolvedBrowserVersion,
                    rootPath: this.rootPath,
                    platform: chromePlatform,
                  });
                  driverPath = driverInstallResult.executablePath;
                  driverVersion = resolvedBrowserVersion;
                }

                return {
                  browserName,
                  browserPlatform,
                  browserVersion: resolvedBrowserVersion,
                  browserMajorVersion,
                  browserPath,
                  browserDriverVersion: driverVersion,
                  browserDriverPath: driverPath,
                };
              }
              break;
            default:
              assertUnreachable(browserPlatform);
          }
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
              const chromePlatform = this.browserPlatformToChromePlatform(browserPlatform);
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

  private browserPlatformToChromePlatform(browserPlatform: BrowserPlatform): ChromePlatform {
    switch (browserPlatform) {
      case 'macos':
        return this.chrome.getChromePlatform({ platform: 'darwin', arch: process.arch });
      case 'windows':
        return this.chrome.getChromePlatform({ platform: 'win32', arch: process.arch });
      default:
        assertUnreachable(browserPlatform);
    }
  }
}
