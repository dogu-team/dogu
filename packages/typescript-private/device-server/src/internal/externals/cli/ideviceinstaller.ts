import { PlatformAbility } from '@dogu-private/dost-children';
import { Serial } from '@dogu-private/types';
import { errorify, Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';

export interface IosAppInfo {
  bundleId: string;
  version: string;
  displayName: string;
}

export class IdeviceInstaller {
  constructor(
    private udid: Serial,
    private logger: Printable,
  ) {
    this.tryAccessAndFix();
  }

  async uninstallApp(appName: string): Promise<child_process.ChildProcess> {
    const { udid, logger } = this;
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--uninstall', appName];
    logger.info(`IdeviceInstallerImpl.uninstallApp ${exe} ${stringify(args)}`);
    return ChildProcess.spawnAndWait(
      exe,
      args,
      {
        env: this.env(),
      },
      logger,
    );
  }

  async installApp(appPath: string): Promise<child_process.ChildProcess> {
    const { udid, logger } = this;
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--install', appPath];
    logger.info(`IdeviceInstallerImpl.installApp ${exe} ${stringify(args)}`);
    return ChildProcess.spawnAndWait(
      exe,
      args,
      {
        env: this.env(),
      },
      logger,
    );
  }

  async getSystemApps(): Promise<IosAppInfo[]> {
    return this.getApps('list_system');
  }

  async getUserApps(): Promise<IosAppInfo[]> {
    return this.getApps('list_user');
  }

  async getAllApps(): Promise<IosAppInfo[]> {
    return this.getApps('list_all');
  }

  async getApps(option: 'list_user' | 'list_system' | 'list_all'): Promise<IosAppInfo[]> {
    const { udid, logger } = this;
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--list-apps', '-o', option];
    logger.info(`IdeviceInstallerImpl.listUserApps ${exe} ${stringify(args)}`);
    const appInfos: IosAppInfo[] = [];
    const proc = await ChildProcess.spawnAndWait(
      exe,
      args,
      {
        env: this.env(),
      },
      {
        info: (data) => {
          const str = stringify(data);
          const lines = str.split(os.EOL);
          for (const line of lines) {
            if (0 === line.length) {
              continue;
            }
            if (line.startsWith('CFBundleIdentifier')) {
              return;
            }
            let [bundieId, version, displayName] = line.split(', ') as (string | undefined)[];
            if (!bundieId || !version || !displayName) {
              logger.error(`IdeviceInstallerImpl.listUserApps invalid line ${line}`);
              continue;
            }
            bundieId = bundieId.replace(/^"/, '').replace(/"$/, '');
            version = version.replace(/^"/, '').replace(/"$/, '');
            displayName = displayName.replace(/^"/, '').replace(/"$/, '');
            appInfos.push({ bundleId: bundieId, version, displayName });
          }
        },
        error: (data) => {},
      },
    );
    return appInfos;
  }

  private tryAccessAndFix = (): void => {
    const bin = HostPaths.external.libimobiledevice.ideviceinstaller();
    try {
      fs.accessSync(bin, fs.constants.X_OK);
    } catch (error) {
      this.makeAccessableSync();
    }
  };

  private makeAccessableSync = (): void => {
    try {
      fs.chmodSync(HostPaths.external.libimobiledevice.ideviceinstaller(), 0o777);
    } catch (e) {
      const error = errorify(e);
      throw new Error(`Failed to chmod ideviceinstaller ${stringify(error)}`);
    }
  };
  private env(): NodeJS.ProcessEnv {
    return {
      ...process.env,
      DYLD_LIBRARY_PATH: this.libPath(),
    };
  }

  private libPath(): string {
    return [HostPaths.external.libimobiledevice.libimobiledeviceLibPath(), process.env.DYLD_LIBRARY_PATH].join(':');
  }
}

registerBootstrapHandler(
  __filename,
  async () => {
    if (process.platform !== 'darwin') {
      return;
    }
    try {
      await fs.promises.chmod(HostPaths.external.libimobiledevice.ideviceinstaller(), 0o777);
    } catch (e) {
      const error = errorify(e);
      throw new Error(`Failed to chmod ideviceinstaller ${stringify(error)}`);
    }
  },
  () => new PlatformAbility().isIosEnabled,
);
