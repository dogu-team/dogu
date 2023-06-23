import { Serial } from '@dogu-private/types';
import { Printable } from '@dogu-tech/common';
import { ChildProcess, DirectoryRotation } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { logger } from '../../../logger/logger.instance';

const directoryRotation = new DirectoryRotation('xctrace', 30);

const XcTraceCommand = 'xctrace';

export async function record(appPath: string, serial: Serial, printable: Printable = logger): Promise<child_process.ChildProcess> {
  await directoryRotation.removeOldWaves();
  const tempDirPath = directoryRotation.getCurrentWavePath();
  if (!fs.existsSync(tempDirPath)) {
    await fs.promises.mkdir(tempDirPath, { recursive: true });
  }
  printable.info(`xctrace record --output ${tempDirPath} --instrument "Thermal State" --device ${serial} --env KEY=VALUE --launch -- ${appPath}`);

  const proc = await ChildProcess.spawnAndWait(
    XcTraceCommand,
    ['record', '--output', tempDirPath, '--instrument', 'Thermal State', '--device', serial, '--env', 'KEY=VALUE', '--launch', '--', appPath],
    {},
    printable,
  );
  await fs.promises.rmdir(tempDirPath, { recursive: true });
  return proc;
}

export async function listDevices(printable: Printable, filterIos = true): Promise<Serial[]> {
  const result = await ChildProcess.exec(`${XcTraceCommand} list devices`, {}, printable);

  const serials: Serial[] = [];

  for await (const line of result.stdout.split('\n')) {
    if (line.startsWith('==') && line.endsWith('==')) {
      if (!line.includes('Devices')) {
        break;
      }
      continue;
    }
    if (filterIos && !line.startsWith('iP')) {
      continue;
    }
    const matches = line.match(/\([^)]+\)/g);
    if (!matches) {
      continue;
    }
    const serial = matches[matches.length - 1].slice(1, -1);
    serials.push(serial);
  }

  return serials;
}
