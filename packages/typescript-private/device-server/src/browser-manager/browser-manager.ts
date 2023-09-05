import { BrowserName, BrowserPlatform, BrowserVersion } from '@dogu-private/types';
import { assertUnreachable, PrefixLogger } from '@dogu-tech/common';
import {
  EnsureBrowserAndDriverOptions,
  EnsureBrowserAndDriverResult,
  FindAllBrowserInstallationsOptions,
  FindAllBrowserInstallationsResult,
} from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { Adb } from '../internal/externals/index';
import { logger } from '../logger/logger.instance';
import { Chrome, ChromeInstallablePlatform } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { Firefox, FirefoxInstallablePlatform } from './firefox';
import { firefoxVersionUtils } from './firefox-version-utils';
import { Geckodriver } from './geckodriver';

interface FindBrowserInstallationOptions {
  browserName: BrowserName;
  browserPlatform: BrowserPlatform;
  browserVersionPrefix: string;
  deviceSerial?: string;
}

type FindBrowserInstallationResult =
  | {
      browserVersion: BrowserVersion;
      browserMajorVersion: number;
      browserPath: string;
    }
  | undefined;

type EnsureBrowserOptions = Omit<EnsureBrowserAndDriverOptions, 'browserVersion'> & { mappedBrowserVersion: BrowserVersion };
type EnsureBrowserResult = Omit<EnsureBrowserAndDriverResult, 'browserDriverVersion' | 'browserDriverPath'>;

type EnsureBrowserDriverOptions = Omit<EnsureBrowserAndDriverOptions, 'browserVersion'> & { browserVersion: BrowserVersion };
type EnsureBrowserDriverResult = Omit<EnsureBrowserAndDriverResult, 'browserVersion' | 'browserMajorVersion' | 'browserPath' | 'browserPackageName'>;

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly rootPath = HostPaths.external.browser.browsersPath();
  private readonly chrome = new Chrome();
  private readonly firefox = new Firefox();
  private readonly geckodriver = new Geckodriver();
  private readonly adb = Adb;

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    const { browserName, browserPlatform, browserVersion, deviceSerial } = options;
    const mappedBrowserVersion = browserVersion ?? 'latest';
    const ensureBrowserResult = await this.ensureBrowser({ browserName, browserPlatform, mappedBrowserVersion, deviceSerial });
    const ensureBrowserDriverResult = await this.ensureBrowserDriver({ browserName, browserPlatform, browserVersion: ensureBrowserResult.browserVersion, deviceSerial });
    return {
      browserName,
      browserPlatform,
      browserVersion: ensureBrowserResult.browserVersion,
      browserMajorVersion: ensureBrowserResult.browserMajorVersion,
      browserPath: ensureBrowserResult.browserPath,
      browserPackageName: ensureBrowserResult.browserPackageName,
      browserDriverVersion: ensureBrowserDriverResult.browserDriverVersion,
      browserDriverPath: ensureBrowserDriverResult.browserDriverPath,
    };
  }

  async findAllBrowserInstallations(options: FindAllBrowserInstallationsOptions): Promise<FindAllBrowserInstallationsResult> {
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

  private async ensureBrowser(options: EnsureBrowserOptions): Promise<EnsureBrowserResult> {
    const { browserName, browserPlatform, mappedBrowserVersion, deviceSerial } = options;
    switch (browserName) {
      case 'chrome':
        {
          switch (browserPlatform) {
            case 'macos':
            case 'windows': {
              const requestedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.chrome.getLatestVersion() : mappedBrowserVersion;
              const browserInstallation = await this.findBrowserInstallationByVersionPrefix({
                browserName,
                browserPlatform,
                browserVersionPrefix: requestedBrowserVersion,
                deviceSerial,
              });

              if (browserInstallation) {
                return {
                  browserName,
                  browserPlatform,
                  browserVersion: browserInstallation.browserVersion,
                  browserMajorVersion: browserInstallation.browserMajorVersion,
                  browserPath: browserInstallation.browserPath,
                };
              }

              const foundBrowserVersion = await this.chrome.findVersion({ prefix: requestedBrowserVersion });
              if (!foundBrowserVersion) {
                throw new Error(`Chrome version ${requestedBrowserVersion} not found`);
              }

              const chromePlatform = this.browserPlatformToChromeInstallablePlatform(browserPlatform);
              if (!chromePlatform) {
                throw new Error(`Chrome is not supported on platform ${browserPlatform}`);
              }

              const browserInstallResult = await this.chrome.install({
                installableName: browserName,
                version: foundBrowserVersion,
                rootPath: this.rootPath,
                platform: chromePlatform,
              });

              return {
                browserName,
                browserPlatform,
                browserVersion: foundBrowserVersion,
                browserMajorVersion: chromeVersionUtils.parse(foundBrowserVersion).major,
                browserPath: browserInstallResult.executablePath,
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
      case 'firefox':
      case 'firefox-devedition': {
        const requestedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.firefox.getLatestVersion({ installableName: browserName }) : mappedBrowserVersion;
        const browserInstallation = await this.findBrowserInstallationByVersionPrefix({
          browserName,
          browserPlatform,
          browserVersionPrefix: requestedBrowserVersion,
          deviceSerial,
        });

        if (browserInstallation) {
          return {
            browserName,
            browserPlatform,
            browserVersion: browserInstallation.browserVersion,
            browserMajorVersion: browserInstallation.browserMajorVersion,
            browserPath: browserInstallation.browserPath,
          };
        }

        const foundBrowserVersion = await this.firefox.findVersion({ installableName: browserName, prefix: requestedBrowserVersion });
        if (!foundBrowserVersion) {
          throw new Error(`Chrome version ${requestedBrowserVersion} not found`);
        }

        const firefoxPlatform = this.browserPlatformToFirefoxInstallablePlatform(browserPlatform);
        if (!firefoxPlatform) {
          throw new Error(`Firefox is not supported on platform ${browserPlatform}`);
        }

        const browserInstallResult = await this.firefox.install({
          installableName: browserName,
          version: foundBrowserVersion,
          rootPath: this.rootPath,
          platform: firefoxPlatform,
        });

        return {
          browserName,
          browserPlatform,
          browserVersion: foundBrowserVersion,
          browserMajorVersion: firefoxVersionUtils.parse(foundBrowserVersion).major,
          browserPath: browserInstallResult.executablePath,
        };
      }
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

  private async ensureBrowserDriver(options: EnsureBrowserDriverOptions): Promise<EnsureBrowserDriverResult> {
    const { browserName, browserPlatform, browserVersion, deviceSerial } = options;
    switch (browserName) {
      case 'chrome':
        {
          const chromePlatform = this.browserPlatformToChromeInstallablePlatform(browserPlatform);
          if (!chromePlatform) {
            throw new Error(`Chrome is not supported on platform ${browserPlatform}`);
          }

          const driverFounds = await this.chrome.findInstallations({ installableName: 'chromedriver', rootPath: this.rootPath, platform: chromePlatform });
          const driverMatchs = driverFounds.filter(({ version }) => version === browserVersion);
          if (driverMatchs.length > 0) {
            const match = driverMatchs[0];
            return {
              browserName,
              browserPlatform,
              browserDriverVersion: match.version,
              browserDriverPath: match.executablePath,
            };
          }

          const driverInstallResult = await this.chrome.install({
            installableName: 'chromedriver',
            version: browserVersion,
            rootPath: this.rootPath,
            platform: chromePlatform,
          });

          return {
            browserName,
            browserPlatform,
            browserDriverVersion: browserVersion,
            browserDriverPath: driverInstallResult.executablePath,
          };
        }
        break;
      case 'firefox':
      case 'firefox-devedition': {
        const driverPath = this.geckodriver.getExecutablePath();
        const driverVersion = await this.geckodriver.getVersion();
        if (!driverVersion) {
          throw new Error('Geckodriver version not found');
        }
        return {
          browserName,
          browserPlatform,
          browserDriverVersion: driverVersion,
          browserDriverPath: driverPath,
        };
      }
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

  private async findBrowserInstallationByVersionPrefix(options: FindBrowserInstallationOptions): Promise<FindBrowserInstallationResult> {
    const { browserName, browserPlatform, browserVersionPrefix, deviceSerial } = options;
    switch (browserName) {
      case 'chrome': {
        const chromePlatform = this.browserPlatformToChromeInstallablePlatform(browserPlatform);
        if (!chromePlatform) {
          throw new Error(`Chrome is not supported on platform ${browserPlatform}`);
        }

        const founds = await this.chrome.findInstallations({ installableName: browserName, rootPath: this.rootPath, platform: chromePlatform });
        const matches = founds.filter(({ version }) => version.startsWith(browserVersionPrefix));
        if (matches.length === 0) {
          return undefined;
        }
        const match = matches[0];
        return {
          browserVersion: match.version,
          browserMajorVersion: chromeVersionUtils.parse(match.version).major,
          browserPath: match.executablePath,
        };
      }
      case 'firefox':
      case 'firefox-devedition': {
        const firefoxPlatform = this.browserPlatformToFirefoxInstallablePlatform(browserPlatform);
        if (!firefoxPlatform) {
          throw new Error(`Firefox is not supported on platform ${browserPlatform}`);
        }

        const founds = await this.firefox.findInstallations({ installableName: browserName, rootPath: this.rootPath, platform: firefoxPlatform });
        const matches = founds.filter(({ version }) => version.startsWith(browserVersionPrefix));
        if (matches.length === 0) {
          return undefined;
        }
        const match = matches[0];
        return {
          browserVersion: match.version,
          browserMajorVersion: firefoxVersionUtils.parse(match.version).major,
          browserPath: match.executablePath,
        };
      }
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
