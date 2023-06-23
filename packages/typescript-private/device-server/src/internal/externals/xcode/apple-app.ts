import { MobileProvisioningProfile, readMobileProvisioingProfile } from '@dogu-tech/node';
import fsPromises from 'fs/promises';
import path from 'path';

export class AppleApp {
  private constructor(readonly filePath: string, readonly provision: MobileProvisioningProfile) {}
  static async create(filePath: string): Promise<AppleApp> {
    const provisionPath = path.resolve(filePath, 'embedded.mobileprovision');
    const contents = await fsPromises.readFile(provisionPath, 'utf-8');

    const provision = await readMobileProvisioingProfile(contents);
    return new AppleApp(filePath, provision);
  }

  hasSerial(serial: string): boolean {
    const item = this.provision.provisionedDevices.find((item) => {
      return item === serial;
    });
    return item !== undefined;
  }
}
