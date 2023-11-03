import { Serial } from '@dogu-private/types';
import { loopTime, Milisecond, Printable } from '@dogu-tech/common';
import { ChildProcess, DirectoryRotation } from '@dogu-tech/node';
import AsyncLock from 'async-lock';
import child_process, { ExecOptions } from 'child_process';
import fs from 'fs';
import { logger } from '../../../logger/logger.instance';
import { DeviceScanResult } from '../../public/device-driver';

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

let scanCache: DeviceScanResult[] = [];
let lastScanCacheTime = 0;
const scanCacheExpire = Milisecond.t1Second;
const scanLock: AsyncLock = new AsyncLock();

export async function listDevices(printable: Printable, options: ExecOptions = {}): Promise<DeviceScanResult[]> {
  const ret = await scanLock.acquire('scan', async () => {
    if (Date.now() - lastScanCacheTime < scanCacheExpire) {
      return scanCache;
    }
    const result = await ChildProcess.exec(`${XcTraceCommand} list devices`, options);

    const infos: DeviceScanResult[] = [];
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
      infos.push({
        serial: device.serial,
        name: device.name,
        status: 'online',
      });
    }
    scanCache = infos;
    lastScanCacheTime = Date.now();

    return infos;
  });

  return ret;
}

export async function waitUntilConnected(serial: Serial, printable: Printable): Promise<void> {
  for await (const _ of loopTime({ period: { seconds: 3 }, expire: { minutes: 5 } })) {
    const deviceInfosFromXctrace = await listDevices(printable, { timeout: Milisecond.t2Minutes }).catch((e) => []);
    if (deviceInfosFromXctrace.find((deviceInfo) => deviceInfo.serial === serial)) {
      break;
    }
  }
  const deviceInfosFromXctrace = await listDevices(printable, { timeout: Milisecond.t2Minutes }).catch((e) => []);
  if (!deviceInfosFromXctrace.find((deviceInfo) => deviceInfo.serial === serial)) {
    throw new Error(`Wait until device ${serial} connected failed. Please check the usb connection.`);
  }
}

export async function waitUntilDisonnected(serial: Serial, printable: Printable): Promise<void> {
  for await (const _ of loopTime({ period: { seconds: 3 }, expire: { minutes: 5 } })) {
    const deviceInfosFromXctrace = await listDevices(printable, { timeout: Milisecond.t2Minutes }).catch((e) => []);
    const some = deviceInfosFromXctrace.find((deviceInfo) => deviceInfo.serial === serial);
    if (!some) {
      break;
    }
  }
  const deviceInfosFromXctrace = await listDevices(printable, { timeout: Milisecond.t2Minutes }).catch((e) => []);
  const some = deviceInfosFromXctrace.find((deviceInfo) => deviceInfo.serial === serial);
  if (some) {
    throw new Error(`Wait until device ${serial} disconnected failed.`);
  }
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
