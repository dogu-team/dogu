import { BrowserDriverInstallation, BrowserDriverInstaller, BrowserDriverInstallerOptions } from '@dogu-tech/device-client-common';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerBrowserDriverInstaller implements BrowserDriverInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserDriverInstallerOptions): boolean {
    return this.seleniumManager.matchForDriver(options);
  }

  async install(options: BrowserDriverInstallerOptions): Promise<BrowserDriverInstallation> {
    return await this.seleniumManager.installDriver(options);
  }
}
