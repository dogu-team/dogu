import { PlatformAbility } from '@dogu-private/dost-children';
import { Milisecond, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import os from 'os';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';

export async function listDevices(option = { timeout: Milisecond.t5Seconds }): Promise<string[]> {
  tryAccessAndFix();
  const libPath = [HostPaths.external.libimobiledevice.libimobiledeviceLibPath(), process.env.DYLD_LIBRARY_PATH].join(':');
  const result = await ChildProcess.exec(`export DYLD_LIBRARY_PATH=${libPath} && ${HostPaths.external.libimobiledevice.ideviceid()}`, option);
  const infos: string[] = [];
  const lines = result.stdout.split(os.EOL);
  for (const line of lines) {
    if (!line.endsWith('(USB)')) {
      continue;
    }
    const udid = line.replace('(USB)', '').trim();
    infos.push(udid);
  }
  return infos;
}

const tryAccessAndFix = (): void => {
  const bin = HostPaths.external.libimobiledevice.ideviceid();
  try {
    fs.accessSync(bin, fs.constants.X_OK);
  } catch (error) {
    makeAccessableSync();
  }
};

const makeAccessableSync = (): void => {
  try {
    fs.chmodSync(HostPaths.external.libimobiledevice.ideviceid(), 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod ideviceid`, { cause });
  }
};

registerBootstrapHandler(
  __filename,
  async () => {
    if (process.platform !== 'darwin') {
      return;
    }
    try {
      await fs.promises.chmod(HostPaths.external.libimobiledevice.ideviceid(), 0o777);
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(stringify(error));
      throw new Error(`Failed to chmod ideviceid`, { cause });
    }
  },
  () => new PlatformAbility().isIosEnabled,
);
