import { categoryFromPlatform, isAllowedBrowserNameForPlatform } from '@dogu-private/types';
import { PrefixLogger } from '@dogu-tech/common';
import { BrowserAutoInstallableChecker, BrowserAutoInstallableCheckerOptions } from '@dogu-tech/device-client-common';
import { logger } from '../logger/logger.instance';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerBrowserAutoInstallableChecker implements BrowserAutoInstallableChecker {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserAutoInstallableCheckerOptions): boolean {
    return this.seleniumManager.matchForBrowser(options);
  }

  check(options: BrowserAutoInstallableCheckerOptions): boolean {
    const { browserName, browserPlatform } = options;
    return isAllowedBrowserNameForPlatform(browserName, browserPlatform);
  }
}

export class MobileBrowserAutoInstallableChecker implements BrowserAutoInstallableChecker {
  private readonly logger = new PrefixLogger(logger, '[MobileBrowserInstallableChecker]');

  match(options: BrowserAutoInstallableCheckerOptions): boolean {
    const { browserPlatform } = options;
    return categoryFromPlatform(browserPlatform) === 'mobile';
  }

  check(options: BrowserAutoInstallableCheckerOptions): boolean {
    const { browserPlatform } = options;
    this.logger.warn(`Auto Mobile browser installation is not supported for platform ${browserPlatform}.`);
    return false;
  }
}
