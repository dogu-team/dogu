import { DriverInstaller, DriverInstallerOptions, InstalledDriverInfo } from './browser-manager.types';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerDriverInstaller implements DriverInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: DriverInstallerOptions): boolean {
    return this.seleniumManager.match(options);
  }

  async install(options: DriverInstallerOptions): Promise<InstalledDriverInfo> {
    return await this.seleniumManager.installDriver(options);
  }
}
