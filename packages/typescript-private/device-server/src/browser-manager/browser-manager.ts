import { getBrowserNamesByPlatform } from '@dogu-private/types';
import { errorify, PrefixLogger, stringify } from '@dogu-tech/common';
import {
  BrowserAllInstallationsFinder,
  BrowserDriverInstaller,
  BrowserDriverInstallerOptions,
  BrowserInfo,
  BrowserInstallableChecker,
  BrowserInstallation,
  BrowserInstallationFinder,
  BrowserInstallationFinderOptions,
  BrowserInstaller,
  BrowserInstallerOptions,
  EnsureBrowserAndDriverOptions,
  EnsureBrowserAndDriverResult,
  FindAllBrowserInstallationsOptions,
  FindAllBrowserInstallationsResult,
  LatestBrowserVersionResolver,
} from '@dogu-tech/device-client-common';
import { logger } from '../logger/logger.instance';
import { SeleniumManagerBrowserInstaller } from './browser-installers';
import { SeleniumManagerBrowserDriverInstaller } from './driver-installers';
import { FirefoxVersionUtils } from './firefox-version-utils';
import { AdbBrowserInstallationFinder } from './installed-browser-finders';
import { ChromeLatestBrowserVersionResolver, FirefoxLatestBrowserVersionResolver } from './latest-browser-version-resolvers';
import { SeleniumManager, SeleniumManagerBrowserAllInstallationsFinder, SeleniumManagerBrowserInstallationFinder } from './selenium-manager';

type MapLatestBrowserVersionOptions = EnsureBrowserAndDriverOptions;
type MapLatestBrowserVersionResult = Omit<MapLatestBrowserVersionOptions, 'browserVersion'> & Pick<BrowserInfo, 'browserVersion'>;

type ResolveLatestBrowserVersionOptions = MapLatestBrowserVersionResult;
type ResolveLatestBrowserVersionResult = ResolveLatestBrowserVersionOptions;

type ParseBrowserMajorVersionOptions = ResolveLatestBrowserVersionResult;
type ParseBrowserMajorVersionResult = ParseBrowserMajorVersionOptions & Pick<BrowserInfo, 'browserMajorVersion'>;

type FindBrowserInstallationOptions = ParseBrowserMajorVersionResult;
type FindBrowserInstallationResult = FindBrowserInstallationOptions & Partial<Pick<BrowserInfo, 'browserPath' | 'browserPackageName' | 'browserDriverPath'>>;

type FindBrowserDriverInstallationOptions = FindBrowserInstallationResult;
type FindBrowserDriverInstallationResult = FindBrowserDriverInstallationOptions;

type CheckBrowserInstallableOptions = FindBrowserDriverInstallationResult;
type CheckBrowserInstallableResult = CheckBrowserInstallableOptions & Pick<BrowserInfo, 'browserInstallable'>;

type InstallBrowserOptions = CheckBrowserInstallableResult;
type InstallBrowserResult = InstallBrowserOptions;

type InstallBrowserDriverOptions = InstallBrowserResult;
type InstallBrowserDriverResult = EnsureBrowserAndDriverResult;

export class BrowserManager {
  static readonly browserMajorVersionPattern = /^(?<browserMajorVersion>\d+).*$/;

  private readonly logger = new PrefixLogger(logger, '[BrowserManager]');
  private readonly latestBrowserVersionResolvers: LatestBrowserVersionResolver[] = [];
  private readonly browserInstallationFinders: BrowserInstallationFinder[] = [];
  private readonly browserAllInstallationsFinders: BrowserAllInstallationsFinder[] = [];
  private readonly browserInstallableCheckers: BrowserInstallableChecker[] = [];
  private readonly browserInstallers: BrowserInstaller[] = [];
  private readonly browserDriverInstallers: BrowserDriverInstaller[] = [];

  constructor() {
    const seleniumManager = new SeleniumManager();
    const firefoxVersionUtils = new FirefoxVersionUtils();
    this.latestBrowserVersionResolvers.push(new ChromeLatestBrowserVersionResolver(), new FirefoxLatestBrowserVersionResolver(firefoxVersionUtils));
    this.browserInstallationFinders.push(new SeleniumManagerBrowserInstallationFinder(seleniumManager), new AdbBrowserInstallationFinder());
    this.browserAllInstallationsFinders.push(new SeleniumManagerBrowserAllInstallationsFinder(seleniumManager));
    this.browserDriverInstallers.push(new SeleniumManagerBrowserDriverInstaller(seleniumManager));
    this.browserInstallers.push(new SeleniumManagerBrowserInstaller(seleniumManager));
    this.browserInstallableCheckers.push(new SeleniumManagerBrowserInstallableChecker(seleniumManager), new MobileBrowserInstallableChecker());
  }

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    try {
      return await this.ensureBrowserAndDriverInternal(options);
    } catch (error) {
      this.logger.error(`Failed to ensure browser and driver`, { error: errorify(error) });
      throw error;
    }
  }

  async ensureBrowserAndDriverInternal(options: EnsureBrowserAndDriverOptions): Promise<EnsureBrowserAndDriverResult> {
    this.logger.info(`Ensuring browser and driver...`, { ...options });

    const mapLatestBrowserVersionResult = this.mapLatestBrowserVersion(options);
    const resolveLatestBrowserVersionResult = await this.resolveLatestBrowserVersion(mapLatestBrowserVersionResult);
    const parseBrowserMajorVersionResult = this.parseBrowserMajorVersion(resolveLatestBrowserVersionResult);
    const findBrowserInstallationResult = await this.findBrowserInstallation(parseBrowserMajorVersionResult);
    const findBrowserDriverInstallationResult = await this.findBrowserDriverInstallation(findBrowserInstallationResult);
    const checkBrowserInstallableResult = this.checkBrowserInstallable(findBrowserDriverInstallationResult);
    const installBrowserResult = await this.installBrowser(checkBrowserInstallableResult);
    const installBrowserDriverResult = await this.installBrowserDriver(installBrowserResult);

    this.logger.info(`Ensured browser and driver.`, { ...installBrowserDriverResult });
    return installBrowserDriverResult;
  }

  private mapLatestBrowserVersion(options: MapLatestBrowserVersionOptions): MapLatestBrowserVersionResult {
    const mappedBrowserVersion = options.browserVersion || 'latest';
    this.logger.info(`Mapped browser version [${stringify(options.browserVersion)}] to [${mappedBrowserVersion}]`);
    return {
      ...options,
      browserVersion: mappedBrowserVersion,
    };
  }

  private async resolveLatestBrowserVersion(options: ResolveLatestBrowserVersionOptions): Promise<ResolveLatestBrowserVersionResult> {
    const { browserVersion } = options;
    if (browserVersion !== 'latest') {
      return options;
    }

    for (const resolver of this.latestBrowserVersionResolvers) {
      if (await resolver.match(options)) {
        return await resolver.resolve(options);
      }
    }

    const { browserName, browserPlatform } = options;
    throw new Error(`Browser [${browserName}] [${browserPlatform}] latest version resolver is not handled.`);
  }

  private parseBrowserMajorVersion(options: ParseBrowserMajorVersionOptions): ParseBrowserMajorVersionResult {
    this.logger.info(`Parsing browser version major version...`, { ...options });

    const { browserVersion } = options;
    const match = browserVersion.match(BrowserManager.browserMajorVersionPattern);
    if (!match) {
      throw new Error(`Browser version match failed: ${browserVersion}`);
    }

    if (!match.groups) {
      throw new Error(`Browser version match groups is undefined: ${browserVersion}`);
    }

    const { browserMajorVersion } = match.groups as Record<string, string | undefined>;
    if (!browserMajorVersion) {
      throw new Error(`Browser major version is undefined: ${browserVersion}`);
    }

    const parsedBrowserMajorVersion = parseInt(browserMajorVersion);
    if (isNaN(parsedBrowserMajorVersion)) {
      throw new Error(`Browser major version is not a number: ${browserVersion}`);
    }

    this.logger.info(`Parsed browser version [${browserVersion}] major version to [${parsedBrowserMajorVersion}]`);
    return {
      ...options,
      browserMajorVersion: parsedBrowserMajorVersion,
    };
  }

  private async findBrowserInstallation(options: FindBrowserInstallationOptions): Promise<FindBrowserInstallationResult> {
    const { browserName, browserPlatform, browserMajorVersion } = options;
    const browserInstallations = await this.findBrowserInstallations({ browserName, browserPlatform, browserMajorVersion });
    if (browserInstallations.length === 0) {
      throw new Error(`Browser ${browserName} ${browserPlatform} ${browserMajorVersion} is not installed.`);
    }

    const browserInstallation = browserInstallations[0];
    this.logger.info(`Found browser installation.`, { ...browserInstallation });
    return browserInstallation;
  }

  private async findBrowserDriverInstallation(options: FindBrowserDriverInstallationOptions): Promise<FindBrowserDriverInstallationResult> {}

  private checkBrowserInstallable(options: CheckBrowserInstallableOptions): CheckBrowserInstallableResult {}

  private async installBrowser(options: InstallBrowserOptions): Promise<InstallBrowserResult> {}

  private async installBrowserDriver(options: InstallBrowserDriverOptions): Promise<InstallBrowserDriverResult> {}

  private parseMajorVersion(version: string): number {
    const majorVersion = version.match(this.majorVersionPattern)?.[1] ?? '';
    if (!majorVersion) {
      throw new Error(`Browser version ${version} is not valid`);
    }
    return Number(majorVersion);
  }

  private needToResolveLatestVersion(browserVersion: string): boolean {
    const needToResolve = browserVersion === 'latest';
    if (needToResolve) {
      this.logger.info(`Browser version ${browserVersion} needs to be resolved.`);
    }

    return needToResolve;
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
