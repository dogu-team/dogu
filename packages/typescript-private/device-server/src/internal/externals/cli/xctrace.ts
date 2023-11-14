import { Serial } from '@dogu-private/types';
import { Milisecond, Printable } from '@dogu-tech/common';
import { ChildProcess, DirectoryRotation } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
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

const XctraceListOutputGroup = ['Devices', 'Devices Offline', 'Simulators', 'unknown'];
type XctraceListOutputGroup = (typeof XctraceListOutputGroup)[number];

let scanCache: Serial[] = [];
let lastScanCacheTime = 0;
const scanCacheExpire = Milisecond.t1Second;
const scanLock: AsyncLock = new AsyncLock();

export async function listDevices(option = { timeout: Milisecond.t5Seconds }): Promise<Serial[]> {
  const ret = await scanLock.acquire('scan', async () => {
    if (Date.now() - lastScanCacheTime < scanCacheExpire) {
      return scanCache;
    }
    const result = await ChildProcess.exec(`${XcTraceCommand} list devices`, option);

    const infos: Serial[] = [];
    let firstDeviceLine = undefined; // macOs Self Device
    let category: XctraceListOutputGroup = 'unknown';

    for await (const line of result.stdout.split('\n')) {
      if (line.startsWith('==') && line.endsWith('==')) {
        const categoryParsed = line.replace(/=+/g, '').trim();
        if (XctraceListOutputGroup.includes(categoryParsed)) {
          category = categoryParsed;
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
      infos.push(device.serial);
    }
    scanCache = infos;
    lastScanCacheTime = Date.now();

    return infos;
  });

  return ret;
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
