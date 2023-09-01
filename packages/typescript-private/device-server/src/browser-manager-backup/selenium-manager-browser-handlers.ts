import { BrowserName, BrowserPlatform } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';
import { FindAllBrowserInstallationsResult } from '@dogu-tech/device-client-common';
import {
  BrowserAllInstallationsFinder,
  BrowserAllInstallationsFinderOptions,
  BrowserDriverInstaller,
  BrowserDriverInstallerOptions,
  BrowserDriverInstallerResult,
  BrowserInstallableChecker,
  BrowserInstallableCheckerOptions,
  BrowserInstallableCheckerResult,
  BrowserInstallationFinder,
  BrowserInstallationFinderOptions,
  BrowserInstallationFinderResult,
  BrowserInstaller,
  BrowserInstallerOptions,
  BrowserInstallerResult,
} from './browser-manager.types';
import { SeleniumManager } from './selenium-manager';

function matchForBrowser(options: { browserName: BrowserName; browserPlatform: BrowserPlatform; browserMajorVersion?: number }): boolean {
  const { browserName, browserPlatform, browserMajorVersion } = options;
  if (!(browserPlatform === 'macos' || browserPlatform === 'windows')) {
    return false;
  }

  if (browserName === 'chrome' && (browserMajorVersion ?? 0) >= 113) {
    return true;
  }

  return false;
}

export class SeleniumManagerBrowserInstallationFinder implements BrowserInstallationFinder {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserInstallationFinderOptions): boolean {
    return matchForBrowser(options);
  }

  async find(options: BrowserInstallationFinderOptions): Promise<BrowserInstallationFinderResult> {
    return await this.seleniumManager.findBrowserInstallation(options);
  }
}

export class SeleniumManagerBrowserAllInstallationsFinder implements BrowserAllInstallationsFinder {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserAllInstallationsFinderOptions): PromiseOrValue<boolean> {
    return matchForBrowser(options);
  }

  findAll(options: BrowserAllInstallationsFinderOptions): PromiseOrValue<FindAllBrowserInstallationsResult> {
    throw new Error('Method not implemented.');
  }
}

export class SeleniumManagerBrowserInstallableChecker implements BrowserInstallableChecker {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserInstallableCheckerOptions): boolean {
    return matchForBrowser(options);
  }

  check(options: BrowserInstallableCheckerOptions): BrowserInstallableCheckerResult {
    const { browserName, browserPlatform } = options;
    return isAllowedBrowserNameForPlatform(browserName, browserPlatform);
  }
}

export class SeleniumManagerBrowserInstaller implements BrowserInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserInstallerOptions): boolean {
    return matchForBrowser(options);
  }

  async install(options: BrowserInstallerOptions): Promise<BrowserInstallerResult> {
    return await this.seleniumManager.installBrowser(options);
  }
}

export class SeleniumManagerBrowserDriverInstaller implements BrowserDriverInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserDriverInstallerOptions): boolean {
    const { browserName, browserMajorVersion } = options;
    if (browserName === 'chrome') {
      if (browserMajorVersion >= 115) {
        return true;
      }
    } else if (browserName === 'firefox') {
    }
  }

  async install(options: BrowserDriverInstallerOptions): Promise<BrowserDriverInstallerResult> {
    return await this.seleniumManager.installDriver(options);
  }
}
