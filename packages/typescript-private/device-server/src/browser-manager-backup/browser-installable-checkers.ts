import { categoryFromPlatform } from '@dogu-private/types';
import { PrefixLogger } from '@dogu-tech/common';
import { BrowserInstallableChecker } from '@dogu-tech/device-client-common';
import { logger } from '../logger/logger.instance';

export class MobileBrowserInstallableChecker implements BrowserInstallableChecker {
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
