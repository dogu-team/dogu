import { Printable } from '@dogu-tech/common';
import { copyDirectoryRecursive, removeItemRecursive } from '@dogu-tech/node';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { AppleApp } from './apple-app';
import { Xctestrun } from './xctestrun';

export class DerivedData {
  readonly productsPath: string;
  private constructor(readonly filePath: string, readonly debugiOSApps: AppleApp[], readonly xctestrun: Xctestrun | null) {
    this.productsPath = path.resolve(filePath, 'Build', 'Products');
  }

  static async create(filePath: string): Promise<DerivedData> {
    if (fs.existsSync(filePath) === false) {
      throw new Error(`DerivedData path does not exist: ${filePath}`);
    }
    const buildPath = path.resolve(filePath, 'Build');
    const productsPath = path.resolve(buildPath, 'Products');

    const debugiOSbuildName = (await fsPromises.readdir(productsPath)).find((item) => {
      return item.startsWith('Debug-iphone');
    });
    if (!debugiOSbuildName) {
      throw new Error(`Debug-iphone build path not found: ${productsPath}`);
    }
    const debugiOSbuildPath = path.resolve(productsPath, debugiOSbuildName);

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
    const remainDirs = [
      { parent: this.filePath, dir: ['Build', 'Logs'] },
      { parent: path.resolve(this.filePath, 'Build'), dir: ['Products'] },
    ];

    for (const remainDir of remainDirs) {
      const dirs = await fsPromises.readdir(remainDir.parent);
      for (const dir of dirs) {
        if (remainDir.dir.indexOf(dir) === -1) {
          await removeItemRecursive(path.resolve(remainDir.parent, dir));
        }
      }
    }
    const debugiOSbuildName = (await fsPromises.readdir(this.productsPath)).find((item) => {
      return item.startsWith('Debug-iphone');
    });
    if (!debugiOSbuildName) {
      return;
    }
    const debugiOSbuildPath = path.resolve(this.productsPath, debugiOSbuildName);

    const allowedExtensions = ['.app'];
    const files = await fsPromises.readdir(debugiOSbuildPath);
    for (const file of files) {
      if (!allowedExtensions.some((ext) => file.endsWith(ext))) {
        await removeItemRecursive(path.resolve(debugiOSbuildPath, file));
      }
    }
  }

  async copyToSerial(parentDirectoryPath: string, serial: string, logger: Printable): Promise<DerivedData> {
    const deviceRunPath = path.resolve(parentDirectoryPath, serial);

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
