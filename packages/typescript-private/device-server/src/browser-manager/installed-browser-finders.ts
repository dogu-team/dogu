import { InstalledBrowserFinder, InstalledBrowserFinderOptions, InstalledBrowserInfo } from './browser-manager.types';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerInstalledBrowserFinder implements InstalledBrowserFinder {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: InstalledBrowserFinderOptions): boolean {
    return this.seleniumManager.match(options);
  }

  async find(options: InstalledBrowserFinderOptions): Promise<InstalledBrowserInfo[]> {
    return await this.seleniumManager.findInstalledBrowser(options);
  }
}
