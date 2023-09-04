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
import { Chrome, ChromeInstallablePlatform } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { Firefox, FirefoxInstallablePlatform } from './firefox';
import { firefoxVersionUtils } from './firefox-version-utils';
import { Geckodriver } from './geckodriver';

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly chrome = new Chrome();
  private readonly firefox = new Firefox();
  private readonly geckodriver = new Geckodriver();
  private readonly rootPath = HostPaths.external.browser.browsersPath();

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    const { browserName, browserPlatform, browserVersion, deviceSerial } = options;
    const mappedBrowserVersion = browserVersion ?? 'latest';
    switch (browserName) {
      case 'chrome':
        {
          switch (browserPlatform) {
            case 'macos':
            case 'windows':
              {
                const resolvedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.chrome.getLatestVersion() : mappedBrowserVersion;
                const chromeVersion = chromeVersionUtils.parse(resolvedBrowserVersion);
                const browserMajorVersion = chromeVersion.major;
                const chromePlatform = this.browserPlatformToChromeInstallablePlatform(browserPlatform);
                if (!chromePlatform) {
                  throw new Error(`Chrome is not supported on platform ${browserPlatform}`);
                }

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
            case 'android':
            case 'ios':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      case 'firefox':
      case 'firefox-devedition':
        {
          switch (browserPlatform) {
            case 'macos':
            case 'windows': {
              const resolvedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.firefox.getLatestVersion({ installableName: browserName }) : mappedBrowserVersion;
              const firefoxVersion = firefoxVersionUtils.parse(resolvedBrowserVersion);
              const browserMajorVersion = firefoxVersion.major;
              const firefoxPlatform = this.browserPlatformToFirefoxInstallablePlatform(browserPlatform);
              if (!firefoxPlatform) {
                throw new Error(`Firefox is not supported on platform ${browserPlatform}`);
              }

              const browserFounds = await this.firefox.findInstallations({ installableName: browserName, rootPath: this.rootPath, platform: firefoxPlatform });
              const browserMatchs = browserFounds.filter(({ majorVersion }) => majorVersion === browserMajorVersion);
              let browserPath = '';
              if (browserMatchs.length > 0) {
                browserPath = browserMatchs[0].executablePath;
              } else {
                const browserInstallResult = await this.firefox.install({
                  installableName: browserName,
                  version: resolvedBrowserVersion,
                  rootPath: this.rootPath,
                  platform: firefoxPlatform,
                });
                browserPath = browserInstallResult.executablePath;
              }

              /**
               * @description henry - geckoDriver to auto installer from external installer
               */
              const driverPath = this.geckodriver.getExecutablePath();
              const driverVersion = await this.geckodriver.getVersion();
              if (!driverVersion) {
                throw new Error('Geckodriver version not found');
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
            case 'android':
            case 'ios':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      case 'safari':
      case 'safaritp':
      case 'edge':
      case 'iexplorer':
      case 'samsung-internet':
        throw new Error('Not implemented');
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
              const chromePlatform = this.browserPlatformToChromeInstallablePlatform(browserPlatform);
              if (!chromePlatform) {
                throw new Error(`Chrome is not supported on platform ${browserPlatform}`);
              }

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
            case 'android':
            case 'ios':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      case 'firefox':
      case 'firefox-devedition':
        {
          switch (browserPlatform) {
            case 'macos':
            case 'windows':
              {
                const firefoxPlatform = this.browserPlatformToFirefoxInstallablePlatform(browserPlatform);
                if (!firefoxPlatform) {
                  throw new Error(`Firefox is not supported on platform ${browserPlatform}`);
                }

                const installations = await this.firefox.findInstallations({ installableName: browserName, rootPath: this.rootPath, platform: firefoxPlatform });
                const browserInstallations = installations.map((installation) => ({
                  browserName,
                  browserPlatform,
                  browserVersion: installation.version,
                  browserMajorVersion: firefoxVersionUtils.parse(installation.version).major,
                  browserPath: installation.executablePath,
                }));
                return { browserInstallations };
              }
              break;
            case 'android':
            case 'ios':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      case 'safari':
      case 'safaritp':
      case 'edge':
      case 'iexplorer':
      case 'samsung-internet':
        throw new Error('Not implemented');
      default:
        assertUnreachable(browserName);
    }
  }

  private browserPlatformToChromeInstallablePlatform(browserPlatform: BrowserPlatform): ChromeInstallablePlatform | undefined {
    switch (browserPlatform) {
      case 'macos':
        return this.chrome.getChromeInstallablePlatform({ platform: 'darwin', arch: process.arch });
      case 'windows':
        return this.chrome.getChromeInstallablePlatform({ platform: 'win32', arch: process.arch });
      case 'android':
      case 'ios':
        return undefined;
      default:
        assertUnreachable(browserPlatform);
    }
  }

  private browserPlatformToFirefoxInstallablePlatform(browserPlatform: BrowserPlatform): FirefoxInstallablePlatform | undefined {
    switch (browserPlatform) {
      case 'macos':
        return this.firefox.getFirefoxInstallablePlatform({ platform: 'darwin', arch: process.arch });
      case 'windows':
        return this.firefox.getFirefoxInstallablePlatform({ platform: 'win32', arch: process.arch });
      case 'android':
      case 'ios':
        return undefined;
      default:
        assertUnreachable(browserPlatform);
    }
  }
}
