import { Serial } from '@dogu-private/types';
import { Printable, stringify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import child_process, { spawn } from 'child_process';
import fs from 'fs';
import { registerBootstrapHandler } from '../../../bootstrap/bootstrap.service';
import { LogHandler } from '../../public/device-channel';

export function logcat(serial: Serial, args: string[], handler: LogHandler, printable?: Printable): child_process.ChildProcess {
  const libPath = [HostPaths.external.libimobiledevice.libimobiledeviceLibPath(), process.env.DYLD_LIBRARY_PATH].join(':');
  const random = Math.random();
  printable?.verbose?.('ios.logcat begin', { serial, args, random });
  const child = spawn(HostPaths.external.libimobiledevice.idevicesyslog(), ['-u', serial, '-e', 'replayd', '-e', 'DoguScreen', ...args], {
    env: {
      ...process.env,
      DYLD_LIBRARY_PATH: libPath,
    },
  });
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    handler.info(stringify(data));
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    handler.error(stringify(data));
  });
  printable?.verbose?.('ios.logcat end', { serial, args, random });
  return child;
}

registerBootstrapHandler(__filename, async () => {
  if (process.platform !== 'darwin') {
    return;
  }
  try {
    await fs.promises.chmod(HostPaths.external.libimobiledevice.idevicesyslog(), 0o777);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(stringify(error));
    throw new Error(`Failed to chmod idevicesyslog`, { cause });
  }
});
