import { BrowserInstaller, BrowserInstallerOptions, InstalledBrowserInfo } from './browser-manager.types';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerBrowserInstaller implements BrowserInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: BrowserInstallerOptions): boolean {
    return this.seleniumManager.matchForBrowser(options);
  }

  async install(options: BrowserInstallerOptions): Promise<InstalledBrowserInfo> {
    return await this.seleniumManager.installBrowser(options);
  }
}
