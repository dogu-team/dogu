import { PlatformAbility } from '@dogu-private/dost-children';
import { Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';
import { idcLogger } from '../../../logger/logger.instance';

class IdeviceInstallerImpl {
  async uninstallApp(udid: string, appName: string, printable: Printable = idcLogger): Promise<child_process.ChildProcess> {
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

  async installApp(udid: string, appPath: string, printable: Printable = idcLogger): Promise<child_process.ChildProcess> {
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
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(stringify(error));
      throw new Error(`Failed to chmod ideviceinstaller`, { cause });
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
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(stringify(error));
      throw new Error(`Failed to chmod ideviceinstaller`, { cause });
    }
  },
  () => new PlatformAbility().isIosEnabled,
);

export const IdeviceInstaller = new IdeviceInstallerImpl();
