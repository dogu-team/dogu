import { AndroidBrowserName, AndroidBrowserPackageNameMap, isAllowedAndroidBrowserName, Serial } from '@dogu-private/types';
import { PrefixLogger } from '@dogu-tech/common';
import { Adb } from '../internal/externals/index';
import { logger } from '../logger/logger.instance';
import { InstalledBrowserFinder, InstalledBrowserFinderOptions, InstalledBrowserInfo } from './browser-manager.types';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerInstalledBrowserFinder implements InstalledBrowserFinder {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: InstalledBrowserFinderOptions): boolean {
    return this.seleniumManager.matchForBrowser(options);
  }

  async find(options: InstalledBrowserFinderOptions): Promise<InstalledBrowserInfo[]> {
    return await this.seleniumManager.findInstalledBrowser(options);
  }
}

export class AdbInstalledBrowserFinder implements InstalledBrowserFinder {
  static readonly packageLinePattern = /^package:(?<package>.*)=(?<packageName>.*)$/;
  static readonly packageVersionLinePattern = /^\s*versionName=(?<version>.*)\s*$/;

  private readonly logger = new PrefixLogger(logger, '[AdbInstalledBrowserFinder]');

  match(options: InstalledBrowserFinderOptions): boolean {
    const { browserName, browserPlatform } = options;
    if (browserPlatform !== 'android') {
      return false;
    }

    return isAllowedAndroidBrowserName(browserName);
  }

  async find(options: InstalledBrowserFinderOptions): Promise<InstalledBrowserInfo[]> {
    const { browserName, browserPlatform, deviceSerial } = options;
    if (!deviceSerial) {
      throw new Error(`Device serial is required. Browser name: ${browserName}, browser platform: ${browserPlatform}`);
    }

    const browserInfos = await this.findInstalledBrowserInfos(deviceSerial);
    const browserInfosWithVersion = await this.findInstalledBrowserInfosWithVersion(deviceSerial, browserInfos);
    return browserInfosWithVersion;
  }

  private async findInstalledBrowserInfos(deviceSerial: Serial): Promise<{ browserPackageName: string; browserName: AndroidBrowserName }[]> {
    const browserNameMap = new Map(Object.entries(AndroidBrowserPackageNameMap).map(([key, value]) => [value, key]));
    const { stdout } = await Adb.shell(deviceSerial, 'pm list packages -f');
    const browserInfos = stdout
      .split('\n')
      .map((line) => {
        return {
          line,
          match: AdbInstalledBrowserFinder.packageLinePattern.exec(line),
        };
      })
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
      .filter(({ packageName, browserName }) => {
        if (!browserName) {
          this.logger.warn(`Failed to find browser name for package name: ${packageName}`);
        }
        return !!browserName;
      })
      .map(({ packageName, browserName }) => ({ browserPackageName: packageName, browserName } as { browserPackageName: string; browserName: AndroidBrowserName }));

    return browserInfos;
  }

  private async findInstalledBrowserInfosWithVersion(
    deviceSerial: Serial,
    browserInfos: { browserPackageName: string; browserName: AndroidBrowserName }[],
  ): Promise<{ browserPackageName: string; browserName: AndroidBrowserName; browserVersion: string }[]> {
    const installedBrowserInfosWithVersionResults = await Promise.allSettled(
      browserInfos.map(async ({ browserPackageName, browserName }) => {
        const { stdout } = await Adb.shell(deviceSerial, `dumpsys package ${browserPackageName} | grep versionName`);
        const packageVersionLines = stdout.split('\n');
        if (packageVersionLines.length < 1) {
          this.logger.warn(`Failed to find version line for package name: ${browserPackageName}`);
          throw new Error(`Failed to find version line for package name: ${browserPackageName}`);
        }

        const packageVersionLine = packageVersionLines[0];
        const packageVersionMatch = AdbInstalledBrowserFinder.packageVersionLinePattern.exec(packageVersionLine);
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

    const installedBrowserInfosWithVersions = installedBrowserInfosWithVersionResults
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

    return installedBrowserInfosWithVersions;
  }
}
