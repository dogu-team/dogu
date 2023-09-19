import { PlatformAbility } from '@dogu-private/dost-children';
import { Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';
import { idcLogger } from '../../../logger/logger.instance';

export async function restart(udid: string, printable: Printable = idcLogger): Promise<string> {
  tryAccessAndFix();
  const libPath = [HostPaths.external.libimobiledevice.libimobiledeviceLibPath(), process.env.DYLD_LIBRARY_PATH].join(':');
  return (await ChildProcess.exec(`export DYLD_LIBRARY_PATH=${libPath} && ${HostPaths.external.libimobiledevice.idevicediagnostics()} restart -u ${udid}`, {}, printable)).stdout;
}

const tryAccessAndFix = (): void => {
  const bin = HostPaths.external.libimobiledevice.idevicediagnostics();
  try {
    fs.accessSync(bin, fs.constants.X_OK);
  } catch (error) {
    makeAccessableSync();
  }
};

const makeAccessableSync = (): void => {
  try {
    fs.chmodSync(HostPaths.external.libimobiledevice.idevicediagnostics(), 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod idevicediagnostics`, { cause });
  }
};

registerBootstrapHandler(__filename, async () => {
  if (process.platform !== 'darwin') {
    return;
  }
  try {
    await fs.promises.chmod(HostPaths.external.libimobiledevice.idevicediagnostics(), 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod idevicediagnostics`, { cause });
  }
}, () => new PlatformAbility().isIosEnabled);
