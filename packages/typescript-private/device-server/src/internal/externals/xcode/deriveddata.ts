import { Printable } from '@dogu-tech/common';
import { copyDirectoryRecursive, HostPaths, removeItemRecursive } from '@dogu-tech/node';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { AppleApp } from './apple-app';
import { Xctestrun } from './xctestrun';

export class DerivedData {
  private constructor(readonly filePath: string, readonly debugiOSApps: AppleApp[], readonly xctestrun: Xctestrun | null) {}

  static async create(filePath: string): Promise<DerivedData> {
    if (fs.existsSync(filePath) === false) {
      throw new Error(`DerivedData path does not exist: ${filePath}`);
    }
    const buildPath = path.resolve(filePath, 'Build');
    const productsPath = path.resolve(buildPath, 'Products');
    const debugiOSbuildPath = path.resolve(productsPath, 'Debug-iphoneos');

    const debugiOSAppPaths = (await fsPromises.readdir(debugiOSbuildPath))
      .filter((item) => {
        return item.endsWith('.app');
      })
      .map((item) => {
        return path.resolve(debugiOSbuildPath, item);
      });
    const appleApps: AppleApp[] = [];
    for (const debugiOSAppPath of debugiOSAppPaths) {
      const appleApp = await AppleApp.create(debugiOSAppPath);
      appleApps.push(appleApp);
    }
    // find .xctestrun file in products
    const xctestrunPath = (await fsPromises.readdir(productsPath)).find((item) => {
      return item.endsWith('.xctestrun');
    });
    const xctestrun = xctestrunPath ? await Xctestrun.create(path.resolve(productsPath, xctestrunPath)) : null;
    return new DerivedData(filePath, appleApps, xctestrun);
  }

  async removeExceptAppsAndXctestrun(): Promise<void> {
    const buildProductsSubDir = path.resolve(this.filePath, 'Build/Products/Debug-iphoneos');

    const allowedExtensions = ['.app'];
    const files = await fsPromises.readdir(buildProductsSubDir);
    for (const file of files) {
      if (!allowedExtensions.some((ext) => file.endsWith(ext))) {
        await removeItemRecursive(`${buildProductsSubDir}/${file}`);
      }
    }
  }

  async copyToSerial(serial: string, logger: Printable): Promise<DerivedData> {
    const idaRunspacesPath = HostPaths.external.xcodeProject.idaDerivedDataClonePath();
    const deviceRunPath = path.resolve(idaRunspacesPath, serial);

    if (fs.existsSync(deviceRunPath)) {
      await fs.promises.rm(deviceRunPath, { recursive: true });
    }
    await copyDirectoryRecursive(this.filePath, deviceRunPath, logger);
    return await DerivedData.create(deviceRunPath);
  }

  hasSerial(serial: string): boolean {
    for (const app of this.debugiOSApps) {
      if (!app.hasSerial(serial)) {
        return false;
      }
    }
    return true;
  }
}
