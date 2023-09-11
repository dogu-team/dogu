import {
  AndroidBrowserPackageNameMap,
  BrowserName,
  BrowserPlatform,
  BrowserVersion,
  getBrowserNamesByPlatform,
  getBrowserPlatformByNodeJsPlatform,
  isAllowedAndroidBrowserName,
} from '@dogu-private/types';
import { assertUnreachable, PrefixLogger } from '@dogu-tech/common';
import {
  EnsureBrowserAndDriverOptions,
  EnsureBrowserAndDriverResult,
  FindAllBrowserInstallationsOptions,
  FindAllbrowserInstallationsResult,
  FindBrowserInstallationsOptions,
  FindBrowserInstallationsResult,
} from '@dogu-tech/device-client-common';
import { HostPaths } from '@dogu-tech/node';
import { Adb } from '../internal/externals/index';
import { logger } from '../logger/logger.instance';
import { Chrome, ChromeInstallablePlatform } from './chrome';
import { chromeVersionUtils } from './chrome-version-utils';
import { Edge, EdgeInstallablePlatformArch, edgeVersionUtils } from './edge';
import { Edgedriver, EdgedriverInstallablePlatform } from './edgedriver';
import { Firefox, FirefoxInstallablePlatform } from './firefox';
import { firefoxVersionUtils } from './firefox-version-utils';
import { Geckodriver } from './geckodriver';
import { Safari, safariVersionUtils } from './safari';
import { Safaridriver } from './safaridriver';

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

type GetLatestBrowserVersionOptions = Pick<EnsureBrowserOptions, 'browserName'> & Partial<Pick<EnsureBrowserOptions, 'browserPlatform'>>;

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly rootPath = HostPaths.external.browser.browsersPath();
  private readonly chrome = new Chrome();
  private readonly firefox = new Firefox();
  private readonly geckodriver = new Geckodriver();
  private readonly edge = new Edge();
  private readonly edgedriver = new Edgedriver();
  private readonly safari = new Safari();
  private readonly safaridriver = new Safaridriver();
  private readonly adb = Adb;

  async getLatestBrowserVersion(options: GetLatestBrowserVersionOptions): Promise<BrowserVersion> {
    const { browserName, browserPlatform } = options;
    switch (browserName) {
      case 'chrome':
        return await this.chrome.getLatestVersion();
      case 'firefox':
      case 'firefox-devedition':
        return await this.firefox.getLatestVersion({ installableName: browserName });
      case 'edge':
        {
          if (!browserPlatform) {
            throw new Error('browserPlatform is required');
          }

          switch (browserPlatform) {
            case 'macos':
            case 'windows': {
              const edgePlatformArch = this.getEdgeInstallablePlatformArchByBrowserPlatform(browserPlatform);
              if (!edgePlatformArch) {
                throw new Error(`Edge is not supported on platform ${browserPlatform}`);
              }

              return await this.edge.getLatestVersion(edgePlatformArch);
            }
            case 'android':
              return await this.edge.getLatestVersion({
                platform: 'Android',
                arch: 'arm64',
              });
            case 'ios':
              return await this.edge.getLatestVersion({
                platform: 'iOS',
                arch: 'arm64',
              });
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      case 'safari':
        {
          if (!browserPlatform) {
            throw new Error('browserPlatform is required');
          }

          switch (browserPlatform) {
            case 'macos':
            case 'windows': {
              this.logger.warn(`Safari is only support default version`);
              return this.safari.getVersion();
            }
            case 'android':
            case 'ios':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserPlatform);
          }
        }
        break;
      case 'safaritp':
      case 'iexplorer':
      case 'samsung-internet':
        throw new Error('Not implemented');
      default:
        assertUnreachable(browserName);
    }
  }

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    const { browserName, browserPlatform, browserVersion, deviceSerial } = options;
    const mappedBrowserVersion = browserVersion ? browserVersion : 'latest';
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

  async ensureBrowser(options: EnsureBrowserOptions): Promise<EnsureBrowserResult> {
    const { browserName, browserPlatform, mappedBrowserVersion, deviceSerial } = options;
    switch (browserPlatform) {
      case 'macos':
      case 'windows':
        {
          switch (browserName) {
            case 'chrome':
              {
                const requestedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.chrome.getLatestVersion() : mappedBrowserVersion;
                const browserInstallation = await this.findBrowserInstallationForDesktopByVersionPrefix({
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

                const chromePlatform = this.getChromeInstallablePlatformByBrowserPlatform(browserPlatform);
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
              break;
            case 'firefox':
            case 'firefox-devedition':
              {
                const requestedBrowserVersion = mappedBrowserVersion === 'latest' ? await this.firefox.getLatestVersion({ installableName: browserName }) : mappedBrowserVersion;
                const browserInstallation = await this.findBrowserInstallationForDesktopByVersionPrefix({
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

                const firefoxPlatform = this.getFirefoxInstallablePlatformByBrowserPlatform(browserPlatform);
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
              break;
            case 'edge':
              {
                const requestedBrowserVersion =
                  mappedBrowserVersion === 'latest'
                    ? await this.getLatestBrowserVersion({
                        browserName,
                        browserPlatform,
                      })
                    : mappedBrowserVersion;
                const browserInstallation = await this.findBrowserInstallationForDesktopByVersionPrefix({
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

                const edgePlatformArch = this.getEdgeInstallablePlatformArchByBrowserPlatform(browserPlatform);
                if (!edgePlatformArch) {
                  throw new Error(`Edge is not supported on platform ${browserPlatform}`);
                }

                const foundBrowserVersion = await this.edge.findVersion({ ...edgePlatformArch, prefix: requestedBrowserVersion });
                if (!foundBrowserVersion) {
                  throw new Error(`Edge version ${requestedBrowserVersion} not found`);
                }

                const browserInstallResult = await this.edge.install({
                  installableName: browserName,
                  platform: edgePlatformArch.platform,
                  arch: edgePlatformArch.arch,
                  version: foundBrowserVersion,
                  rootPath: this.rootPath,
                });

                return {
                  browserName,
                  browserPlatform,
                  browserVersion: foundBrowserVersion,
                  browserMajorVersion: edgeVersionUtils.parse(foundBrowserVersion).major,
                  browserPath: browserInstallResult.executablePath,
                };
              }
              break;
            case 'safari':
              {
                const browserVersion = await this.safari.getVersion();
                const browserMajorVersion = safariVersionUtils.parse(browserVersion).major;
                const browserPath = this.safari.getExecutablePath();
                return {
                  browserName,
                  browserPlatform,
                  browserVersion,
                  browserMajorVersion,
                  browserPath,
                };
              }
              break;
            case 'safaritp':
            case 'iexplorer':
            case 'samsung-internet':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserName);
          }
        }
        break;
      case 'android':
        {
          const findBrowserInstallationsResult = await this.findBrowserInstallationsForAndroid({ browserName, browserPlatform, deviceSerial });
          if (findBrowserInstallationsResult.browserInstallations.length === 0) {
            throw new Error(`Browser ${browserName} not found`);
          }

          const browserInstallation = findBrowserInstallationsResult.browserInstallations[0];
          return {
            browserName,
            browserPlatform,
            browserVersion: browserInstallation.browserVersion,
            browserMajorVersion: browserInstallation.browserMajorVersion,
            browserPackageName: browserInstallation.browserPackageName,
          };
        }
        break;
      case 'ios':
        throw new Error('Not implemented');
      default:
        assertUnreachable(browserPlatform);
    }
  }

  private async ensureBrowserDriverForChrome(options: EnsureBrowserDriverOptions): Promise<EnsureBrowserDriverResult> {
    const { browserName, browserPlatform, browserVersion } = options;
    const resolvedBrowserPlatform = this.getBrowserPlatformForBrowserDriver(browserPlatform);
    const chromePlatform = this.getChromeInstallablePlatformByBrowserPlatform(resolvedBrowserPlatform);
    if (!chromePlatform) {
      throw new Error(`Chrome is not supported on platform ${resolvedBrowserPlatform}`);
    }

    const driverFounds = await this.chrome.findInstallations({ installableName: 'chromedriver', rootPath: this.rootPath, platform: chromePlatform });
    const parsedBrowserVersion = chromeVersionUtils.parse(browserVersion);
    const driverMatchs = driverFounds.filter(({ majorVersion }) => majorVersion === parsedBrowserVersion.major);
    if (driverMatchs.length > 0) {
      const match = driverMatchs[0];
      return {
        browserName,
        browserPlatform,
        browserDriverVersion: match.version,
        browserDriverPath: match.executablePath,
      };
    }

    const foundBrowserVersion = await this.chrome.findVersion({ prefix: `${parsedBrowserVersion.major}` });
    if (!foundBrowserVersion) {
      throw new Error(`Chrome version ${parsedBrowserVersion.major} not found`);
    }

    const driverInstallResult = await this.chrome.install({
      installableName: 'chromedriver',
      version: foundBrowserVersion,
      rootPath: this.rootPath,
      platform: chromePlatform,
    });

    return {
      browserName,
      browserPlatform,
      browserDriverVersion: foundBrowserVersion,
      browserDriverPath: driverInstallResult.executablePath,
    };
  }

  private async ensureBrowserDriverForFirefox(options: EnsureBrowserDriverOptions): Promise<EnsureBrowserDriverResult> {
    const { browserName, browserPlatform } = options;
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

  private async ensureBrowserDriverForSafari(options: EnsureBrowserDriverOptions): Promise<EnsureBrowserDriverResult> {
    const { browserName, browserPlatform } = options;
    const driverPath = this.safaridriver.getExecutablePath();
    const driverVersion = await this.safaridriver.getVersion();
    if (!driverVersion) {
      throw new Error('Safaridriver version not found');
    }

    return {
      browserName,
      browserPlatform,
      browserDriverVersion: driverVersion,
      browserDriverPath: driverPath,
    };
  }

  private async ensureBrowserDriverForEdge(options: EnsureBrowserDriverOptions): Promise<EnsureBrowserDriverResult> {
    const { browserName, browserVersion, browserPlatform } = options;
    const resolvedBrowserPlatform = this.getBrowserPlatformForBrowserDriver(browserPlatform);
    const edgedriverPlatform = this.getEdgedriverInstallablePlatformByBrowserPlatform(resolvedBrowserPlatform);
    if (!edgedriverPlatform) {
      throw new Error(`Edge is not supported on platform ${resolvedBrowserPlatform}`);
    }

    const driverFounds = await this.edgedriver.findInstallations({ installableName: 'msedgedriver', rootPath: this.rootPath, platform: edgedriverPlatform });
    const parsedBrowserVersion = edgeVersionUtils.parse(browserVersion);
    const driverMatchs = driverFounds.filter(({ majorVersion }) => majorVersion === parsedBrowserVersion.major);
    if (driverMatchs.length > 0) {
      const match = driverMatchs[0];
      return {
        browserName,
        browserPlatform,
        browserDriverVersion: match.version,
        browserDriverPath: match.executablePath,
      };
    }

    const foundBrowserVersion = await this.edgedriver.findVersion({ prefix: `${parsedBrowserVersion.major}`, platform: edgedriverPlatform });
    if (!foundBrowserVersion) {
      throw new Error(`Chrome version ${parsedBrowserVersion.major} not found`);
    }

    const driverInstallResult = await this.edgedriver.install({
      installableName: 'msedgedriver',
      version: foundBrowserVersion.version,
      rootPath: this.rootPath,
      platform: edgedriverPlatform,
    });

    return {
      browserName,
      browserPlatform,
      browserDriverVersion: foundBrowserVersion.version,
      browserDriverPath: driverInstallResult.executablePath,
    };
  }

  async ensureBrowserDriver(options: EnsureBrowserDriverOptions): Promise<EnsureBrowserDriverResult> {
    const { browserName, browserPlatform, browserVersion, deviceSerial } = options;
    switch (browserName) {
      case 'chrome':
        return await this.ensureBrowserDriverForChrome({ browserName, browserPlatform, browserVersion, deviceSerial });
      case 'firefox':
      case 'firefox-devedition':
        return await this.ensureBrowserDriverForFirefox({ browserName, browserPlatform, browserVersion, deviceSerial });
      case 'safari':
      case 'safaritp':
        return await this.ensureBrowserDriverForSafari({ browserName, browserPlatform, browserVersion, deviceSerial });
      case 'edge':
        return await this.ensureBrowserDriverForEdge({ browserName, browserPlatform, browserVersion, deviceSerial });
      case 'iexplorer':
      case 'samsung-internet':
        throw new Error('Not implemented');
      default:
        assertUnreachable(browserName);
    }
  }

  private async findBrowserInstallationsForChromeDesktop(options: FindBrowserInstallationsOptions): Promise<FindBrowserInstallationsResult> {
    const { browserName, browserPlatform } = options;
    if (browserName !== 'chrome') {
      throw new Error(`Browser ${browserName} is not supported`);
    }

    const chromePlatform = this.getChromeInstallablePlatformByBrowserPlatform(browserPlatform);
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

  private async findBrowserInstallationsForFirefoxDesktop(options: FindBrowserInstallationsOptions): Promise<FindBrowserInstallationsResult> {
    const { browserName, browserPlatform } = options;
    if (browserName !== 'firefox') {
      throw new Error(`Browser ${browserName} is not supported`);
    }

    const firefoxPlatform = this.getFirefoxInstallablePlatformByBrowserPlatform(browserPlatform);
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

  private async findBrowserInstallationsForEdgeDesktop(options: FindBrowserInstallationsOptions): Promise<FindBrowserInstallationsResult> {
    const { browserName, browserPlatform } = options;
    if (browserName !== 'edge') {
      throw new Error(`Browser ${browserName} is not supported`);
    }

    const edgePlatformArch = this.getEdgeInstallablePlatformArchByBrowserPlatform(browserPlatform);
    if (!edgePlatformArch) {
      throw new Error(`Edge is not supported on platform ${browserPlatform}`);
    }

    const installations = await this.edge.findInstallations({
      installableName: browserName,
      rootPath: this.rootPath,
      platform: edgePlatformArch.platform,
      arch: edgePlatformArch.arch,
    });
    const browserInstallations = installations.map((installation) => ({
      browserName,
      browserPlatform,
      browserVersion: installation.version,
      browserMajorVersion: edgeVersionUtils.parse(installation.version).major,
      browserPath: installation.executablePath,
    }));
    return { browserInstallations };
  }

  async findBrowserInstallations(options: FindBrowserInstallationsOptions): Promise<FindBrowserInstallationsResult> {
    const { browserName, browserPlatform, deviceSerial } = options;
    switch (browserPlatform) {
      case 'macos':
      case 'windows':
        {
          switch (browserName) {
            case 'chrome':
              return await this.findBrowserInstallationsForChromeDesktop({ browserName, browserPlatform, deviceSerial });
            case 'firefox':
            case 'firefox-devedition':
              return await this.findBrowserInstallationsForFirefoxDesktop({ browserName, browserPlatform, deviceSerial });
            case 'edge':
              return await this.findBrowserInstallationsForEdgeDesktop({ browserName, browserPlatform, deviceSerial });
            case 'safari': {
              const browserVersion = await this.safari.getVersion();
              const browserMajorVersion = safariVersionUtils.parse(browserVersion).major;
              const browserPath = this.safari.getExecutablePath();
              return {
                browserInstallations: [
                  {
                    browserName,
                    browserPlatform,
                    browserVersion,
                    browserMajorVersion,
                    browserPath,
                  },
                ],
              };
            }
            case 'safaritp':
            case 'iexplorer':
            case 'samsung-internet':
              throw new Error('Not implemented');
            default:
              assertUnreachable(browserName);
          }
        }
        break;
      case 'android':
        return this.findBrowserInstallationsForAndroid({ browserName, browserPlatform, deviceSerial });
      case 'ios':
        throw new Error('Not implemented');
      default:
        assertUnreachable(browserPlatform);
    }
  }

  async findAllBrowserInstallations(options: FindAllBrowserInstallationsOptions): Promise<FindAllbrowserInstallationsResult> {
    const { browserPlatform, deviceSerial } = options;
    const setteleds = await Promise.allSettled(
      getBrowserNamesByPlatform(browserPlatform).map(async (browserName) => this.findBrowserInstallations({ browserName, browserPlatform, deviceSerial })),
    );
    const browserInstallations = setteleds
      .map((setteled) => {
        if (setteled.status === 'rejected') {
          this.logger.warn(setteled.reason);
          return undefined;
        } else if (setteled.status === 'fulfilled') {
          return setteled.value;
        }
      })
      .filter((result): result is FindBrowserInstallationsResult => !!result)
      .map((result) => result.browserInstallations)
      .flat();
    return { browserInstallations };
  }

  private async findBrowserInstallationForDesktopByVersionPrefix(options: FindBrowserInstallationOptions): Promise<FindBrowserInstallationResult> {
    const { browserName, browserPlatform, browserVersionPrefix } = options;
    switch (browserName) {
      case 'chrome': {
        const chromePlatform = this.getChromeInstallablePlatformByBrowserPlatform(browserPlatform);
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
        const firefoxPlatform = this.getFirefoxInstallablePlatformByBrowserPlatform(browserPlatform);
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
      case 'edge': {
        const edgePlatformArch = this.getEdgeInstallablePlatformArchByBrowserPlatform(browserPlatform);
        if (!edgePlatformArch) {
          throw new Error(`Edge is not supported on platform ${browserPlatform}`);
        }

        const founds = await this.edge.findInstallations({
          installableName: browserName,
          rootPath: this.rootPath,
          platform: edgePlatformArch.platform,
          arch: edgePlatformArch.arch,
        });
        const matches = founds.filter(({ version }) => version.startsWith(browserVersionPrefix));
        if (matches.length === 0) {
          if (browserPlatform === 'windows') {
            if (founds.length === 0) {
              return undefined;
            }

            const found = founds[0];
            return {
              browserVersion: found.version,
              browserMajorVersion: edgeVersionUtils.parse(found.version).major,
              browserPath: found.executablePath,
            };
          }

          return undefined;
        }
        const match = matches[0];
        return {
          browserVersion: match.version,
          browserMajorVersion: edgeVersionUtils.parse(match.version).major,
          browserPath: match.executablePath,
        };
      }
      case 'safari':
      case 'safaritp':
      case 'iexplorer':
      case 'samsung-internet':
        throw new Error('Not implemented');
      default:
        assertUnreachable(browserName);
    }
  }

  private getBrowserPlatformForBrowserDriver(browserPlatform: BrowserPlatform): BrowserPlatform {
    switch (browserPlatform) {
      case 'macos':
      case 'windows':
        return browserPlatform;
      case 'android':
        return getBrowserPlatformByNodeJsPlatform(process.platform);
      case 'ios':
        return getBrowserPlatformByNodeJsPlatform(process.platform);
      default:
        assertUnreachable(browserPlatform);
    }
  }

  private getChromeInstallablePlatformByBrowserPlatform(browserPlatform: BrowserPlatform): ChromeInstallablePlatform | undefined {
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

  private getFirefoxInstallablePlatformByBrowserPlatform(browserPlatform: BrowserPlatform): FirefoxInstallablePlatform | undefined {
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

  private getEdgeInstallablePlatformArchByBrowserPlatform(browserPlatform: BrowserPlatform): EdgeInstallablePlatformArch | undefined {
    switch (browserPlatform) {
      case 'macos':
        return this.edge.getEdgeInstallablePlatformArch({ platform: 'darwin' });
      case 'windows':
        return this.edge.getEdgeInstallablePlatformArch({ platform: 'win32' });
      case 'android':
      case 'ios':
        return undefined;
      default:
        assertUnreachable(browserPlatform);
    }
  }

  private getEdgedriverInstallablePlatformByBrowserPlatform(browserPlatform: BrowserPlatform): EdgedriverInstallablePlatform | undefined {
    switch (browserPlatform) {
      case 'macos':
        return this.edgedriver.getEdgedriverInstallablePlatform({ platform: 'darwin' });
      case 'windows':
        return this.edgedriver.getEdgedriverInstallablePlatform({ platform: 'win32' });
      case 'android':
      case 'ios':
        return undefined;
      default:
        assertUnreachable(browserPlatform);
    }
  }

  private async findBrowserInstallationsForAndroid(options: FindBrowserInstallationsOptions): Promise<FindBrowserInstallationsResult> {
    const { browserName, browserPlatform, deviceSerial } = options;
    if (!deviceSerial) {
      throw new Error('deviceSerial is required');
    }

    const androidBrowserNameMap = new Map(Object.entries(AndroidBrowserPackageNameMap).map(([browserName, packageName]) => [packageName, browserName]));
    const installedPackages = await this.adb.getIntalledPackages(deviceSerial);
    const installedBrowserPackages = installedPackages.filter(({ packageName }) => {
      const androidBrowserName = androidBrowserNameMap.get(packageName);
      return browserName === androidBrowserName;
    });
    const installedPackageInfos = await Promise.allSettled(
      installedBrowserPackages.map(async ({ packageName }) => {
        const info = await this.adb.getInstalledPackageInfo(deviceSerial, packageName, { versionName: true });
        const browserName = androidBrowserNameMap.get(packageName);
        if (!browserName) {
          throw new Error(`Browser name not found for package name ${packageName}`);
        }

        return {
          browserName,
          packageName,
          versionName: info.versionName,
        };
      }),
    );

    const packageInfos = installedPackageInfos
      .filter((setteled): setteled is PromiseFulfilledResult<{ browserName: string; packageName: string; versionName: string | undefined }> => setteled.status === 'fulfilled')
      .map((setteled) => setteled.value)
      .filter((value): value is { browserName: string; packageName: string; versionName: string } => !!value.versionName);

    const browserInstallations = packageInfos.map(({ browserName, packageName, versionName }) => {
      if (!isAllowedAndroidBrowserName(browserName)) {
        throw new Error(`Browser name ${browserName} is not allowed`);
      }

      let browserMajorVersion: number | undefined = undefined;
      switch (browserName) {
        case 'chrome':
          browserMajorVersion = chromeVersionUtils.parse(versionName).major;
          break;
        case 'edge':
          browserMajorVersion = edgeVersionUtils.parse(versionName).major;
          break;
        case 'firefox':
          browserMajorVersion = firefoxVersionUtils.parse(versionName).major;
          break;
        case 'samsung-internet':
          browserMajorVersion = chromeVersionUtils.parse(versionName).major;
          break;
        default:
          assertUnreachable(browserName);
      }

      return {
        browserName,
        browserPlatform,
        browserVersion: versionName,
        browserMajorVersion,
        browserPackageName: packageName,
      };
    });

    return { browserInstallations };
  }
}
