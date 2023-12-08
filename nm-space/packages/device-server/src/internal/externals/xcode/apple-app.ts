import { MobileProvisioningProfile, readMobileProvisioingProfile } from '@dogu-tech/node';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

export class AppleApp {
  private constructor(
    readonly filePath: string,
    readonly provision: MobileProvisioningProfile | null,
  ) {}
  static async create(filePath: string): Promise<AppleApp> {
    const provisionPath = path.resolve(filePath, 'embedded.mobileprovision');
    let provision = null;
    if (fs.existsSync(provisionPath)) {
      const contents = await fsPromises.readFile(provisionPath, 'utf-8');
      provision = await readMobileProvisioingProfile(contents);
    }
    return new AppleApp(filePath, provision);
  }

  hasSerial(serial: string): boolean {
    if (!this.provision) {
      return false;
    }
    const item = this.provision.provisionedDevices.find((item) => {
      return item === serial;
    });
    return item !== undefined;
  }
}
