import { PrefixLogger } from '@dogu-tech/common';
import { logger } from '../logger/logger.instance';
import { SeleniumManagerBrowserInstaller } from './browser-installers';
import {
  BrowserInstaller,
  BrowserInstallerOptions,
  DriverInstaller,
  DriverInstallerOptions,
  EnsureBrowserAndDriverOptions,
  EnsuredBrowserAndDriverInfo,
  InstalledBrowserFinder,
  InstalledBrowserFinderOptions,
  InstalledBrowserInfo,
  InstalledDriverInfo,
  LatestBrowserVersionResolver,
  LatestBrowserVersionResolverOptions,
  ResolvedBrowserVersionInfo,
} from './browser-manager.types';
import { SeleniumManagerDriverInstaller } from './driver-installers';
import { SeleniumManagerInstalledBrowserFinder } from './installed-browser-finders';
import { ChromeLatestBrowserVersionResolver } from './latest-browser-version-resolvers';
import { SeleniumManager } from './selenium-manager';

export class BrowserManager {
  private readonly logger = new PrefixLogger(logger, 'BrowserManager');
  private readonly majorVersionPattern = /^[0-9]+.*$/g;
  private readonly latestBrowserVersionResolvers: LatestBrowserVersionResolver[] = [new ChromeLatestBrowserVersionResolver()];
  private readonly installedBrowserFinders: InstalledBrowserFinder[] = [];
  private readonly driverInstallers: DriverInstaller[] = [];
  private readonly browserInstallers: BrowserInstaller[] = [];

  constructor() {
    const seleniumManager = new SeleniumManager();
    this.installedBrowserFinders.push(new SeleniumManagerInstalledBrowserFinder(seleniumManager));
    this.driverInstallers.push(new SeleniumManagerDriverInstaller(seleniumManager));
    this.browserInstallers.push(new SeleniumManagerBrowserInstaller(seleniumManager));
  }

  async ensureBrowserAndDriver(options: EnsureBrowserAndDriverOptions): Promise<EnsuredBrowserAndDriverInfo> {
    const { browserName, browserPlatform, requestedBrowserVersion } = options;
    this.logger.info(`Ensuring browser and driver...`, { browserName, browserPlatform, requestedBrowserVersion });

    const mappedBrowserVersion = this.mapLatestVersion(requestedBrowserVersion);
    this.logger.info(`Mapped browser version ${requestedBrowserVersion} to ${mappedBrowserVersion}.`);

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
    const resolvedBrowserVersionMajor = this.parseMajorVersion(resolvedBrowserVersion);
    this.logger.info(`Resolved browser version ${resolvedBrowserVersion} major version to ${resolvedBrowserVersionMajor}.`);

    const installedBrowserInfos = await this.findInstalledBrowserInfos({ browserName, browserPlatform, resolvedBrowserVersion, resolvedBrowserVersionMajor });
    this.logger.info(`Found ${installedBrowserInfos.length} installed browsers.`, { installedBrowserInfos });

    const installedBrowserWithDriverInfos = installedBrowserInfos.filter(({ driverPath }) => driverPath?.length ?? 0 > 0) as EnsuredBrowserAndDriverInfo[];
    const matchedInstalledBrowserWithDriverInfo = installedBrowserWithDriverInfos.length > 0 ? installedBrowserWithDriverInfos[0] : undefined;
    if (matchedInstalledBrowserWithDriverInfo) {
      const { browserPath, driverPath } = matchedInstalledBrowserWithDriverInfo;
      this.logger.info(`Found installed browser with driver.`, { browserPath, driverPath });
      return matchedInstalledBrowserWithDriverInfo;
    }

    const installedBrowserWithoutDriverInfos = installedBrowserInfos.filter(({ driverPath }) => driverPath?.length ?? 0 === 0);
    const matchedInstalledBrowserWithoutDriverInfo = installedBrowserWithoutDriverInfos.length > 0 ? installedBrowserWithoutDriverInfos[0] : undefined;
    if (matchedInstalledBrowserWithoutDriverInfo) {
      const { browserPath } = matchedInstalledBrowserWithoutDriverInfo;
      this.logger.info(`Found installed browser without driver.`, { browserPath });

      const installedDriverInfo = await this.installDriver({ browserName, browserPlatform, resolvedBrowserVersion });
      const { driverPath } = installedDriverInfo;
      this.logger.info(`Installed driver.`, { driverPath });

      return {
        browserPath,
        driverPath,
      };
    }

    const installedBrowserInfo = await this.installBrowser({ browserName, browserPlatform, resolvedBrowserVersion });
    const { browserPath, driverPath } = installedBrowserInfo;
    this.logger.info(`Installed browser.`, { browserPath });

    if (driverPath) {
      this.logger.info(`Installed browser with driver.`, { browserPath, driverPath });

      return {
        browserPath,
        driverPath,
      };
    }

    const installedDriverInfo = await this.installDriver({ browserName, browserPlatform, resolvedBrowserVersion });
    this.logger.info(`Installed driver.`, { driverPath: installedDriverInfo.driverPath });

    return {
      browserPath,
      driverPath: installedDriverInfo.driverPath,
    };
  }

  private parseMajorVersion(version: string): number {
    const majorVersion = this.majorVersionPattern.exec(version)?.[0] ?? '';
    if (!majorVersion) {
      throw new Error(`Browser version ${version} is not valid.`);
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

  private async findInstalledBrowserInfos(options: InstalledBrowserFinderOptions): Promise<InstalledBrowserInfo[]> {
    const results: InstalledBrowserInfo[] = [];
    for (const finder of this.installedBrowserFinders) {
      if (await finder.match(options)) {
        const infos = await finder.find(options);
        results.push(...infos);
      }
    }
    return results;
  }

  private async installDriver(options: DriverInstallerOptions): Promise<InstalledDriverInfo> {
    const { browserName, browserPlatform, resolvedBrowserVersion } = options;
    for (const installer of this.driverInstallers) {
      if (await installer.match(options)) {
        return await installer.install(options);
      }
    }

    throw new Error(`Browser ${browserName} ${browserPlatform} ${resolvedBrowserVersion} driver installer is not handled.`);
  }

  private async installBrowser(options: BrowserInstallerOptions): Promise<InstalledBrowserInfo> {
    const { browserName, browserPlatform, resolvedBrowserVersion } = options;
    for (const installer of this.browserInstallers) {
      if (await installer.match(options)) {
        return await installer.install(options);
      }
    }

    throw new Error(`Browser ${browserName} ${browserPlatform} ${resolvedBrowserVersion} installer is not handled.`);
  }
}
