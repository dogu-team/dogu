import { PlatformAbility } from '@dogu-private/dost-children';
import { Serial } from '@dogu-private/types';
import { errorify, Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';

export class IdeviceInstaller {
  constructor(private udid: Serial, private logger: Printable) {
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
        env: {
          ...process.env,
          DYLD_LIBRARY_PATH: this.libPath(),
        },
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
        env: {
          ...process.env,
          DYLD_LIBRARY_PATH: this.libPath(),
        },
      },
      logger,
    );
  }

  async listUserApps(): Promise<ChildProcess.ExecResult> {
    const { udid, logger } = this;
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--list-apps', '-o', 'list_user'];
    logger.info(`IdeviceInstallerImpl.listUserApps ${exe} ${stringify(args)}`);
    return await ChildProcess.exec(`${exe} ${args.join(' ')}`, {});
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
