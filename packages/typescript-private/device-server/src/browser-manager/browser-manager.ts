import { getBrowserNamesByPlatform } from '@dogu-private/types';
import { errorify, PrefixLogger, stringify } from '@dogu-tech/common';
import {
  BrowserAndDriverInstallation,
  BrowserAutoInstallableChecker,
  BrowserDriverInstallation,
  BrowserDriverInstaller,
  BrowserDriverInstallerOptions,
  BrowserInstallation,
  BrowserInstallationFinder,
  BrowserInstallationFinderOptions,
  BrowserInstaller,
  BrowserInstallerOptions,
  EnsureBrowserAndDriverOptions,
  FindAllBrowserInstallationsOptions,
  FindAllBrowserInstallationsResult,
  LatestBrowserVersionResolver,
  LatestBrowserVersionResolverOptions,
  ResolvedBrowserVersionInfo,
} from '@dogu-tech/device-client-common';
import { logger } from '../logger/logger.instance';
import { MobileBrowserAutoInstallableChecker, SeleniumManagerBrowserAutoInstallableChecker } from './browser-auto-installable-checkers';
import { SeleniumManagerBrowserInstaller } from './browser-installers';
import { SeleniumManagerBrowserDriverInstaller } from './driver-installers';
import { AdbBrowserInstallationFinder, SeleniumManagerBrowserInstallationFinder } from './installed-browser-finders';
import { ChromeLatestBrowserVersionResolver } from './latest-browser-version-resolvers';
import { SeleniumManager } from './selenium-manager';

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly majorVersionPattern = /^(\d+).*$/;
  private readonly latestBrowserVersionResolvers: LatestBrowserVersionResolver[] = [new ChromeLatestBrowserVersionResolver()];
  private readonly browserInstallationFinders: BrowserInstallationFinder[] = [];
  private readonly browserDriverInstallers: BrowserDriverInstaller[] = [];
  private readonly browserInstallers: BrowserInstaller[] = [];
  private readonly browserAutoInstallableCheckers: BrowserAutoInstallableChecker[] = [];

  constructor() {
    const seleniumManager = new SeleniumManager();
    this.browserInstallationFinders.push(new SeleniumManagerBrowserInstallationFinder(seleniumManager), new AdbBrowserInstallationFinder());
    this.browserDriverInstallers.push(new SeleniumManagerBrowserDriverInstaller(seleniumManager));
    this.browserInstallers.push(new SeleniumManagerBrowserInstaller(seleniumManager));
    this.browserAutoInstallableCheckers.push(new SeleniumManagerBrowserAutoInstallableChecker(seleniumManager), new MobileBrowserAutoInstallableChecker());
  }

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<BrowserAndDriverInstallation> {
    try {
      return await this.ensureBrowserAndDriverInternal(options);
    } catch (error) {
      this.logger.error(`Failed to ensure browser and driver`, { error: errorify(error) });
      throw error;
    }
  }

  async ensureBrowserAndDriverInternal(options: EnsureBrowserAndDriverOptions): Promise<BrowserAndDriverInstallation> {
    const { browserName, browserPlatform, requestedBrowserVersion, deviceSerial } = options;
    this.logger.info(`Ensuring browser and driver...`, { browserName, browserPlatform, requestedBrowserVersion, deviceSerial });

    const mappedBrowserVersion = this.mapLatestVersion(requestedBrowserVersion);
    this.logger.info(`Mapped browser version ${stringify(requestedBrowserVersion)} to ${mappedBrowserVersion}.`);

    let resolvedBrowserVersionInfo: ResolvedBrowserVersionInfo = { browserVersion: mappedBrowserVersion };
    if (this.needToResolveLatestVersion(mappedBrowserVersion)) {
      this.logger.info(`Browser version ${mappedBrowserVersion} needs to be resolved.`);
      resolvedBrowserVersionInfo = await this.resolveLatestVersion(options);
      const { browserVersion: resolvedBrowserVersion } = resolvedBrowserVersionInfo;
      this.logger.info(`Resolved browser version ${mappedBrowserVersion} to ${resolvedBrowserVersion}.`);
    } else {
      this.logger.info(`Browser version ${mappedBrowserVersion} does not need to be resolved.`);
    }

    const resolvedBrowserVersion = resolvedBrowserVersionInfo.browserVersion;
    const resolvedBrowserMajorVersion = this.parseMajorVersion(resolvedBrowserVersion);
    this.logger.info(`Resolved browser version ${resolvedBrowserVersion} major version to ${resolvedBrowserMajorVersion}.`);

    const browserInstallations = await this.findBrowserInstallations({ browserName, browserPlatform, deviceSerial, resolvedBrowserVersion, resolvedBrowserMajorVersion });
    this.logger.info(`Found ${browserInstallations.length} installed browsers.`, { browserInstallations });

    const browserInstallationWithDriverInfos = browserInstallations.filter(({ browserDriverPath }) => browserDriverPath?.length ?? 0 > 0) as BrowserAndDriverInstallation[];
    const matchedBrowserInstallationWithDriverInfo = browserInstallationWithDriverInfos.length > 0 ? browserInstallationWithDriverInfos[0] : undefined;
    if (matchedBrowserInstallationWithDriverInfo) {
      const { browserPath, browserDriverPath } = matchedBrowserInstallationWithDriverInfo;
      this.logger.info(`Found installed browser with driver.`, { browserPath, browserDriverPath });

      return matchedBrowserInstallationWithDriverInfo;
    }

    const browserInstallationWithoutDriverInfos = browserInstallations.filter(({ browserDriverPath }) => browserDriverPath?.length ?? 0 === 0);
    const matchedBrowserInstallationWithoutDriverInfo = browserInstallationWithoutDriverInfos.length > 0 ? browserInstallationWithoutDriverInfos[0] : undefined;
    if (matchedBrowserInstallationWithoutDriverInfo) {
      const { browserPath, browserPackageName, browserVersion, browserMajorVersion } = matchedBrowserInstallationWithoutDriverInfo;
      this.logger.info(`Found installed browser without driver.`, { browserPath });

      const browserDriverInstallation = await this.installDriver({ browserName, browserPlatform, resolvedBrowserVersion: browserVersion ?? resolvedBrowserVersion });
      const { browserDriverPath } = browserDriverInstallation;
      this.logger.info(`Installed driver.`, { browserDriverPath });

      return {
        browserName,
        browserVersion: browserVersion ?? resolvedBrowserVersion,
        browserMajorVersion: browserMajorVersion ?? resolvedBrowserMajorVersion,
        browserPath,
        browserDriverPath,
        browserPackageName,
      };
    }

    const isBrowserAutoInstallable = await this.browserAutoInstallableCheckers.reduce(async (previous, current) => {
      const previousValue = await previous;
      if (previousValue) {
        return previousValue;
      }
      return await current.match({ browserName, browserPlatform });
    }, Promise.resolve(false));
    this.logger.info(`Is browser ${browserName} ${browserPlatform} auto installable?`, { isBrowserAutoInstallable });

    if (!isBrowserAutoInstallable) {
      throw new Error(`Browser ${browserName} ${browserPlatform} is not auto installable. Please install it manually.`);
    }

    const browserInstallation = await this.installBrowser({ browserName, browserPlatform, resolvedBrowserVersion });
    const { browserPath, browserDriverPath } = browserInstallation;
    this.logger.info(`Installed browser.`, { browserPath });

    if (browserDriverPath) {
      this.logger.info(`Installed browser with driver.`, { browserPath, browserDriverPath });

      return {
        browserName,
        browserPath,
        browserDriverPath,
      };
    }

    const installedDriverInfo = await this.installDriver({ browserName, browserPlatform, resolvedBrowserVersion });
    this.logger.info(`Installed driver.`, { browserDriverPath: installedDriverInfo.browserDriverPath });

    return {
      browserName,
      browserPath,
      browserDriverPath: installedDriverInfo.browserDriverPath,
    };
  }

  private parseMajorVersion(version: string): number {
    const majorVersion = version.match(this.majorVersionPattern)?.[1] ?? '';
    if (!majorVersion) {
      throw new Error(`Browser version ${version} is not valid`);
    }
    return Number(majorVersion);
  }

  private mapLatestVersion(browserVersion?: string): string {
    return browserVersion || 'latest';
  }

  private needToResolveLatestVersion(browserVersion: string): boolean {
    return browserVersion === 'latest';
  }

  private async resolveLatestVersion(options: LatestBrowserVersionResolverOptions): Promise<ResolvedBrowserVersionInfo> {
    const { browserName, browserPlatform } = options;
    for (const resolver of this.latestBrowserVersionResolvers) {
      if (await resolver.match(options)) {
        return await resolver.resolve(options);
      }
    }
    throw new Error(`Browser ${browserName} ${browserPlatform} latest version resolver is not handled.`);
  }

  private async findBrowserInstallations(options: BrowserInstallationFinderOptions): Promise<BrowserInstallation[]> {
    const results: BrowserInstallation[] = [];
    for (const finder of this.browserInstallationFinders) {
      if (await finder.match(options)) {
        const infos = await finder.find(options);
        results.push(...infos);
      }
    }
    return results;
  }

  async findAllBrowserInstallations(options: FindAllBrowserInstallationsOptions): Promise<FindAllBrowserInstallationsResult> {
    const { browserPlatform } = options;
    const browserNames = getBrowserNamesByPlatform(browserPlatform);
    const promiseResults = await Promise.allSettled(browserNames.map(async (browserName) => this.findBrowserInstallations({ ...options, browserName })));
    const results = promiseResults
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => {
        if (result.status === 'rejected') {
          throw new Error(`Internal error: already filtered to fulfilled`);
        }
        return result.value;
      });
    return results;
  }

  private async installDriver(options: BrowserDriverInstallerOptions): Promise<BrowserDriverInstallation> {
    const { browserName, browserPlatform, resolvedBrowserVersion } = options;
    for (const installer of this.browserDriverInstallers) {
      if (await installer.match(options)) {
        return await installer.install(options);
      }
    }

    throw new Error(`Browser ${browserName} ${browserPlatform} ${resolvedBrowserVersion} driver installer is not handled.`);
  }

  private async installBrowser(options: BrowserInstallerOptions): Promise<BrowserInstallation> {
    const { browserName, browserPlatform, resolvedBrowserVersion } = options;
    for (const installer of this.browserInstallers) {
      if (await installer.match(options)) {
        return await installer.install(options);
      }
    }

    throw new Error(`Browser ${browserName} ${browserPlatform} ${resolvedBrowserVersion} installer is not handled.`);
  }
}
