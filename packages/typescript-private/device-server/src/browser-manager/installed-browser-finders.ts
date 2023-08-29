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
  static readonly packageLinePattern = /^package:(?<package>.*)=(?<packageName>.*)$/;
  static readonly packageVersionLinePattern = /^\s*versionName=(?<version>.*)\s*$/;

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
    const { stdout } = await Adb.shell(deviceSerial, 'pm list packages -f');
    const browserInfos = stdout
      .split('\n')
      .map((line) => ({
        line,
        match: line.match(AdbBrowserInstallationFinder.packageLinePattern),
      }))
      .filter(({ line, match }) => {
        if (!match) {
          this.logger.warn(`Failed to match package line: ${line}`);
        }
        return !!match;
      })
      .map(({ line, match }) => ({ line, match } as { line: string; match: RegExpExecArray }))
      .filter(({ line, match }) => {
        if (!match.groups) {
          this.logger.warn(`Failed to match groups in package line: ${line}`);
        }
        return !!match.groups;
      })
      .map(({ line, match }) => ({ line, groups: match.groups } as { line: string; groups: Record<string, string> }))
      .filter(({ line, groups }) => {
        if (!groups.packageName) {
          this.logger.warn(`Failed to find package name in package line: ${line}`);
        }
        return !!groups.packageName;
      })
      .map(({ groups }) => ({ packageName: groups.packageName } as { packageName: string }))
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
        const { stdout } = await Adb.shell(deviceSerial, `dumpsys package ${browserPackageName} | grep versionName`);
        const packageVersionLines = stdout.split('\n');
        if (packageVersionLines.length < 1) {
          this.logger.warn(`Failed to find version line for package name: ${browserPackageName}`);
          throw new Error(`Failed to find version line for package name: ${browserPackageName}`);
        }

        const packageVersionLine = packageVersionLines[0];
        const packageVersionMatch = packageVersionLine.match(AdbBrowserInstallationFinder.packageVersionLinePattern);
        if (!packageVersionMatch) {
          this.logger.warn(`Failed to match package version line: ${packageVersionLine}`);
          throw new Error(`Failed to match package version line: ${packageVersionLine}`);
        }

        if (!packageVersionMatch.groups) {
          this.logger.warn(`Failed to match groups in package version line: ${packageVersionLine}`);
          throw new Error(`Failed to match groups in package version line: ${packageVersionLine}`);
        }

        const { version } = packageVersionMatch.groups;
        return { browserPackageName, browserName, browserVersion: version };
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
