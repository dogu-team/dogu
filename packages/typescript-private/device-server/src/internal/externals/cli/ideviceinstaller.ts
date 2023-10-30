import { PlatformAbility } from '@dogu-private/dost-children';
import { errorify, Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';

class IdeviceInstallerImpl {
  async uninstallApp(udid: string, appName: string, printable: Printable): Promise<child_process.ChildProcess> {
    this.tryAccessAndFix();
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--uninstall', appName];
    printable.info(`IdeviceInstallerImpl.uninstallApp ${exe} ${stringify(args)}`);
    return ChildProcess.spawnAndWait(
      exe,
      args,
      {
        env: {
          ...process.env,
          DYLD_LIBRARY_PATH: this.libPath(),
        },
      },
      printable,
    );
  }

  async installApp(udid: string, appPath: string, printable: Printable): Promise<child_process.ChildProcess> {
    this.tryAccessAndFix();
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--install', appPath];
    printable.info(`IdeviceInstallerImpl.installApp ${exe} ${stringify(args)}`);
    return ChildProcess.spawnAndWait(
      exe,
      args,
      {
        env: {
          ...process.env,
          DYLD_LIBRARY_PATH: this.libPath(),
        },
      },
      printable,
    );
  }

  async listuserApps(udid: string, printable: Printable): Promise<child_process.ChildProcess> {
    this.tryAccessAndFix();
    const exe = HostPaths.external.libimobiledevice.ideviceinstaller();
    const args = ['-u', udid, '--list-apps', '-o', 'list_user'];
    printable.info(`IdeviceInstallerImpl.installApp ${exe} ${stringify(args)}`);
    return ChildProcess.spawnAndWait(
      exe,
      args,
      {
        env: {
          ...process.env,
          DYLD_LIBRARY_PATH: this.libPath(),
        },
      },
      printable,
    );
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

export const IdeviceInstaller = new IdeviceInstallerImpl();
