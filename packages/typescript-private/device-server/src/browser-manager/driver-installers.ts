import { DriverInstaller, DriverInstallerOptions, InstalledDriverInfo } from '@dogu-tech/device-client-common';
import { SeleniumManager } from './selenium-manager';

export class SeleniumManagerDriverInstaller implements DriverInstaller {
  constructor(private readonly seleniumManager: SeleniumManager) {}

  match(options: DriverInstallerOptions): boolean {
    return this.seleniumManager.matchForDriver(options);
  }

  async install(options: DriverInstallerOptions): Promise<InstalledDriverInfo> {
    return await this.seleniumManager.installDriver(options);
  }
}
