import { Serial } from '@dogu-private/types';
import { Printable } from '@dogu-tech/common';
import { ChildProcess, DirectoryRotation } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { logger } from '../../../logger/logger.instance';
import { DeviceScanInfo } from '../../public/device-driver';

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

const XctraceListOutputGroup = ['Devices', 'Devices Offline', 'Simulators', 'unknown'];
type XctraceListOutputGroup = (typeof XctraceListOutputGroup)[number];

export async function listDevices(printable: Printable): Promise<DeviceScanInfo[]> {
  const result = await ChildProcess.exec(`${XcTraceCommand} list devices`, {}, printable);

  const infos: DeviceScanInfo[] = [];
  let firstDeviceLine = undefined; // macOs Self Device
  let category: XctraceListOutputGroup = 'unknown';

  for await (const line of result.stdout.split('\n')) {
    if (line.startsWith('==') && line.endsWith('==')) {
      const categoryParsed = line.replace(/=+/g, '').trim();
      if (XctraceListOutputGroup.includes(categoryParsed as XctraceListOutputGroup)) {
        category = categoryParsed as XctraceListOutputGroup;
      } else {
        category = 'unknown';
      }
      continue;
    }
    if (!firstDeviceLine) {
      firstDeviceLine = line;
      continue;
    }
    if (category !== 'Devices' && category !== 'Devices Offline') {
      continue;
    }
    const device = parseDeviceLine(line);
    if (!device) {
      continue;
    }
    infos.push({
      serial: device.serial,
      name: device.name,
      status: 'online',
    });
  }

  return infos;
}

function parseDeviceLine(line: string): { serial: string; osVersion: string; name: string } | null {
  const splited = line.split('(');
  if (splited.length < 2) {
    return null;
  }
  const serial = splited[splited.length - 1].replace(')', '').trim();
  const osVersion = splited[splited.length - 2].replace(')', '').trim();
  const name = splited
    .slice(0, splited.length - 2)
    .join('(')
    .trim();
  return {
    serial,
    osVersion,
    name,
  };
}
