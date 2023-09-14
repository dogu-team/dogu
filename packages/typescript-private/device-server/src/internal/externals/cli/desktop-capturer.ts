import { DeviceWindowInfo } from '@dogu-private/types';
import { Printable, stringify } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';

const binPath = (): string => HostPaths.thirdParty.pathMap().common.desktopCapturer;

export async function getWindows(printable: Printable): Promise<DeviceWindowInfo[]> {
  tryAccessAndFix();
  const res = await ChildProcess.exec(`${binPath()} windows --info`, {}, printable);
  if (0 == res.stdout.length) {
    return [];
  }
  const infos = JSON.parse(res.stdout) as DeviceWindowInfo[];
  return infos;
}

const tryAccessAndFix = (): void => {
  const bin = binPath();
  try {
    fs.accessSync(bin, fs.constants.X_OK);
  } catch (error) {
    makeAccessableSync();
  }
};

const makeAccessableSync = (): void => {
  try {
    fs.chmodSync(binPath(), 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod desktop-capturer`, { cause });
  }
};

registerBootstrapHandler(__filename, async () => {
  try {
    await fs.promises.chmod(binPath(), 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod desktop-capturer`, { cause });
  }
});
