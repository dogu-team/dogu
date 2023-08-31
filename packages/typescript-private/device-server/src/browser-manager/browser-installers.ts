import { BrowserInstallation, BrowserInstaller, BrowserInstallerOptions } from '@dogu-tech/device-client-common';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerBrowserInstaller implements BrowserInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserInstallerOptions): boolean {
    return this.seleniumManager.matchForBrowser(options);
  }

  async install(options: BrowserInstallerOptions): Promise<BrowserInstallation> {
    return await this.seleniumManager.installBrowser(options);
  }
}