import { AndroidBrowserName, AndroidBrowserPackageNameMap, isAllowedAndroidBrowserName, Serial } from '@dogu-private/types';
import { PrefixLogger } from '@dogu-tech/common';
import { BrowserInstallation, BrowserInstallationFinder, BrowserInstallationFinderOptions } from '@dogu-tech/device-client-common';
import { Adb } from '../internal/externals/index';
import { logger } from '../logger/logger.instance';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerBrowserInstallationFinder implements BrowserInstallationFinder {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserInstallationFinderOptions): boolean {
    return this.seleniumManager.matchForBrowser(options);
  }

  async find(options: BrowserInstallationFinderOptions): Promise<BrowserInstallation[]> {
    return await this.seleniumManager.findBrowserInstallation(options);
  }
}

export class AdbBrowserInstallationFinder implements BrowserInstallationFinder {
  private readonly logger = new PrefixLogger(logger, '[AdbBrowserInstallationFinder]');

  match(options: BrowserInstallationFinderOptions): boolean {
    const { browserName, browserPlatform } = options;
    if (browserPlatform !== 'android') {
      return false;
    }

    return isAllowedAndroidBrowserName(browserName);
  }

  async find(options: BrowserInstallationFinderOptions): Promise<BrowserInstallation[]> {
    const { browserName, browserPlatform, deviceSerial } = options;
    if (!deviceSerial) {
      throw new Error(`Device serial is required. Browser name: ${browserName}, browser platform: ${browserPlatform}`);
    }

    const browserInfos = await this.findAllBrowserInstallations(deviceSerial);
    const filteredInfos = browserInfos.filter(({ browserName: name }) => name === browserName);
    const browserInfosWithVersion = await this.findBrowserInstallationsWithVersion(deviceSerial, filteredInfos);
    return browserInfosWithVersion;
  }

  private async findAllBrowserInstallations(deviceSerial: Serial): Promise<{ browserPackageName: string; browserName: AndroidBrowserName }[]> {
    const browserNameMap = new Map(Object.entries(AndroidBrowserPackageNameMap).map(([key, value]) => [value, key]));
    const installedPackages = await Adb.getIntalledPackages(deviceSerial);
    const browserInfos = installedPackages
      .map(({ packageName }) => {
        const browserName = browserNameMap.get(packageName);
        return { packageName, browserName };
      })
      .filter(({ browserName }) => !!browserName)
      .map(({ packageName, browserName }) => ({ browserPackageName: packageName, browserName } as { browserPackageName: string; browserName: AndroidBrowserName }));

    return browserInfos;
  }

  private async findBrowserInstallationsWithVersion(
    deviceSerial: Serial,
    browserInfos: { browserPackageName: string; browserName: AndroidBrowserName }[],
  ): Promise<{ browserPackageName: string; browserName: AndroidBrowserName; browserVersion: string }[]> {
    const browserInstallationsWithVersionResults = await Promise.allSettled(
      browserInfos.map(async ({ browserPackageName, browserName }) => {
        const installedPackageInfo = await Adb.getInstalledPackageInfo(deviceSerial, browserPackageName, { versionName: true });
        const { versionName } = installedPackageInfo;
        if (!versionName) {
          throw new Error(`Failed to find browser version. Browser name: ${browserName}, browser package name: ${browserPackageName}`);
        }
        return { browserPackageName, browserName, browserVersion: versionName };
      }),
    );

    const browserInstallationsWithVersions = browserInstallationsWithVersionResults
      .filter(({ status }) => {
        if (status === 'rejected') {
          this.logger.warn(`Failed to find browser version: ${status}`);
        }

        return status === 'fulfilled';
      })
      .map((info) => {
        if (info.status === 'rejected') {
          throw new Error('Internal error: already filtered to fulfilled');
        }
        return info.value;
      });

    return browserInstallationsWithVersions;
  }
}
