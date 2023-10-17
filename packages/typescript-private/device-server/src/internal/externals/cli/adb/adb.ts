import { PlatformAbility } from '@dogu-private/dost-children';
import { PrivateProtocol, Serial } from '@dogu-private/types';
import { errorify, Printable, stringify } from '@dogu-tech/common';
import { ChildProcess } from '@dogu-tech/node';
import child_process, { execFile, ExecFileOptionsWithStringEncoding, spawn } from 'child_process';
import fs from 'fs';
import util from 'util';
import { registerBootstrapHandler } from '../../../../bootstrap/bootstrap.service';
import { adbLogger } from '../../../../logger/logger.instance';
import { pathMap } from '../../../../path-map';
import { LogHandler } from '../../../public/device-channel';
import { DeviceScanResult, DeviceScanStatus } from '../../../public/device-driver';
import { parseRecord } from '../../../util/parse';
import { AndroidDfInfo, AndroidProcCpuInfo, AndroidProcDiskstats, AndroidProcMemInfo, AndroidPropInfo, AndroidShellTopInfo } from './info';
import {
  AndroidFileEntry,
  parseAndroidLs,
  parseAndroidProcCpuInfo,
  parseAndroidProcDiskstats,
  parseAndroidProcMemInfo,
  parseAndroidShellDf,
  parseAndroidShellProp,
  parseAndroidShellTop,
} from './parse';

export const DOGU_ADB_SERVER_PORT = 5037;

export function adbBinary(): string {
  if (process.env.DOGU_ADB_PATH) {
    return process.env.DOGU_ADB_PATH;
  } else {
    return pathMap().android.adb;
  }
}

export function adbPrefix(): string {
  return `${adbBinary()} -P ${DOGU_ADB_SERVER_PORT}`;
}

const execFileAsync = util.promisify(execFile);

type DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;

function exec(command: string, options: child_process.ExecOptions = {}, printable: Printable = adbLogger): ReturnType<typeof ChildProcess.exec> {
  return ChildProcess.exec(command, options, printable);
}

function execIgnoreError(command: string, options: child_process.ExecOptions = {}, printable: Printable = adbLogger): ReturnType<typeof ChildProcess.execIgnoreError> {
  return ChildProcess.execIgnoreError(command, options, printable);
}

function commandIgnoreError(
  serial: Serial,
  command: string,
  options: child_process.ExecOptions = {},
  printable: Printable = adbLogger,
): ReturnType<typeof ChildProcess.execIgnoreError> {
  return execIgnoreError(`${adbPrefix()} -s ${serial} ${command}`, options, printable);
}

export function shell(
  serial: Serial,
  command: string,
  options: ExecFileOptionsWithStringEncoding = {
    windowsVerbatimArguments: true,
    encoding: 'utf8',
  },
  printable: Printable = adbLogger,
): ReturnType<typeof ChildProcess.exec> {
  return new Promise((resolve, reject) => {
    execFile(adbBinary(), ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', command], options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function shellIgnoreError(
  serial: Serial,
  command: string,
  options: child_process.ExecOptions = {},
  printable: Printable = adbLogger,
): ReturnType<typeof ChildProcess.execIgnoreError> {
  return execIgnoreError(`${adbPrefix()} -s ${serial} shell "${command}"`, options, printable);
}

interface PackageInfo {
  pid: number;
  uid: number;
  name: string;
}

function DefaultPackageInfo(): PackageInfo {
  return {
    pid: -1,
    uid: -1,
    name: '',
  };
}

// network
export async function startServer(): Promise<void> {
  await exec(`${adbPrefix()} start-server`);
}

export async function killServer(): Promise<void> {
  await exec(`${adbPrefix()} kill-server`);
}

export async function forward(serial: Serial, hostPort: number, devicePort: number, printable: Printable = adbLogger): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.forward begin', {
    serial,
    hostPort,
    devicePort,
    random,
  });
  await exec(`${adbPrefix()} -s ${serial} forward tcp:${hostPort} tcp:${devicePort}`);
  printable.verbose?.(`${serial} is forwarding from ${hostPort} to ${devicePort}`);
  adbLogger.verbose(`adb.forward end`, {
    serial,
    hostPort,
    devicePort,
    random,
  });
}

export async function unforward(serial: Serial, hostPort: number, option?: { ignore: boolean }, printable: Printable = adbLogger): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.unforward begin', { serial, hostPort, random });
  let func = exec;
  if (option?.ignore) {
    func = execIgnoreError;
  }
  await func(`${adbPrefix()} -s ${serial} forward --remove tcp:${hostPort}`);
  printable.verbose?.(`${serial} is unforwarding from ${hostPort} to ${hostPort}`);
  adbLogger.verbose('adb.unforward end', { random });
}

export async function unforwardall(serial: Serial, printable: Printable = adbLogger): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.unforwardall begin', { serial, random });
  await exec(`${adbPrefix()} -s ${serial} forward --remove-all`);
  adbLogger.verbose('adb.unforwardall end', { serial, random });
}

export async function logcatClear(serial: Serial, printable?: Printable): ReturnType<typeof ChildProcess.exec> {
  const random = Math.random();
  adbLogger.verbose('adb.logcatClear begin', { serial, random });
  const result = await execIgnoreError(`${adbPrefix()} -s ${serial} logcat -c`, { timeout: 3 * 1000 }, printable);
  adbLogger.verbose('adb.logcatClear end', { serial, random });
  return result;
}

export function logcat(serial: Serial, args: string[], handler: LogHandler, printable?: Printable): child_process.ChildProcess {
  const random = Math.random();
  adbLogger.verbose('adb.logcat begin', { serial, args, random });
  const child = spawn(adbBinary(), ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'logcat', ...args]);
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    handler.info(stringify(data));
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    handler.error(stringify(data));
  });

  child.on('error', (err) => {
    handler.error(stringify(err));
  });
  adbLogger.verbose('adb.logcat end', { serial, args, random });
  return child;
}

export async function isPortOpen(serial: Serial, port: number, printable: Printable = adbLogger): Promise<boolean> {
  const random = Math.random();
  adbLogger.verbose('adb.isPortOpen begin', { serial, port, random });
  const result = await shell(serial, `netstat -eanut | grep LISTEN | grep tcp | grep :${port}`).catch((e) => {
    const stringified = stringify(e);
    printable.verbose?.(`isPortOpen error`, { error: stringified });
    return { stdout: '', stderr: stringified };
  });
  const rv = result.stdout.length > 0;
  adbLogger.verbose('adb.isPortOpen end', { serial, port, random });
  return rv;
}

export async function getPackageOnPort(serial: Serial, port: number): Promise<PackageInfo> {
  const random = Math.random();
  adbLogger.verbose('adb.getPackageOnPort begin', { serial, port, random });
  const result = await shellIgnoreError(serial, `netstat -eanut | grep LISTEN | grep tcp | grep :${port}`);
  const splited = parseRecord(result.stdout);
  if (splited.length < 7) {
    return DefaultPackageInfo();
  }
  const uid = parseInt(splited[6]);
  const rv = await getPackageInfoFromUid(serial, uid);
  adbLogger.verbose('adb.getPackageOnPort end', { serial, port, random });
  return rv;
}

// app control
export async function uninstallApp(serial: Serial, appName: string, keep = false, printable: Printable = adbLogger): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.uninstallApp begin', { serial, appName, keep, random });
  const command = ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'uninstall'];
  if (keep) {
    command.push('-k');
  }
  command.push(appName);
  await ChildProcess.spawnAndWait(adbBinary(), command, { timeout: 60000 * 5 }, printable).catch((err) => {
    printable.error?.(`ChildProcess.uninstallApp failed`, { error: stringify(err) });
    return;
  });
  adbLogger.verbose('adb.uninstallApp end', { serial, appName, keep, random });
}

export async function clearApp(serial: Serial, appName: string, printable: Printable = adbLogger): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.clearApp begin', { serial, appName, random });
  const command = ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', 'pm', 'clear', appName];
  await ChildProcess.spawnAndWait(adbBinary(), command, { timeout: 60000 * 5 }, printable).catch((err) => {
    printable.error?.(`ChildProcess.clearApp failed`, { error: stringify(err) });
    return;
  });
  adbLogger.verbose('adb.clearApp end', { serial, appName, random });
}

export async function resetAppPermission(serial: Serial, appName: string, printable: Printable = adbLogger): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.resetAppPermission begin', { serial, appName, random });
  const command = ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', 'pm', 'reset-permissions', appName];
  await ChildProcess.spawnAndWait(adbBinary(), command, { timeout: 60000 * 5 }, printable).catch((err) => {
    printable.error?.(`ChildProcess.resetAppPermission failed`, { error: stringify(err) });
    return;
  });
  adbLogger.verbose('adb.resetAppPermission end', { serial, appName, random });
}

function installAppArgsInternal(serial: Serial, apkPath: string): { command: string; args: string[] } {
  return { command: adbBinary(), args: ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'install', '-r', '-d', '-t', '-g', apkPath] };
}

export async function installApp(serial: Serial, apkPath: string, printable: Printable = adbLogger): Promise<child_process.ChildProcess> {
  const random = Math.random();
  adbLogger.verbose('adb.installApp begin', { serial, apkPath, random });
  const { command, args } = installAppArgsInternal(serial, apkPath);
  const rv = await ChildProcess.spawnAndWait(command, args, { timeout: 60000 * 5 }, printable);
  adbLogger.verbose('adb.installApp end', { serial, apkPath, random });
  return rv;
}

export async function installAppWithReturningStdoutStderr(serial: Serial, apkPath: string, timeout: number, printable: Printable): Promise<ChildProcess.ExecResult> {
  const random = Math.random();
  adbLogger.verbose('adb.installAppWithReturningStdoutStderr begin', { serial, apkPath, timeout, random });
  const { command, args } = installAppArgsInternal(serial, apkPath);
  printable.verbose?.('installAppWithReturningStdoutStderr start', { command: `${command} ${args.join(' ')}` });
  const rv = await new Promise<ChildProcess.ExecResult>((resolve, reject) => {
    execFile(
      command,
      args,
      {
        windowsVerbatimArguments: true,
        timeout,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      },
    );
  });
  adbLogger.verbose('adb.installAppWithReturningStdoutStderr end', { serial, apkPath, timeout, random });
  return rv;
}

export async function runApp(serial: Serial, packageName: string, launchableActivityName: string, printable: Printable = adbLogger): Promise<child_process.ChildProcess> {
  const random = Math.random();
  adbLogger.verbose('adb.runApp begin', { serial, packageName, launchableActivityName, random });
  const rv = await ChildProcess.spawnAndWait(
    adbBinary(),
    ['-P', `${DOGU_ADB_SERVER_PORT}`, '-s', serial, 'shell', 'am', 'start', '-e', 'testkey', 'testvalue', '-n', `${packageName}/${launchableActivityName}`],
    {},
    printable,
  );
  adbLogger.verbose('adb.runApp end', { serial, packageName, launchableActivityName, random });
  return rv;
}

export async function getPidOf(serial: Serial, appName: string, printable?: Printable): Promise<string> {
  const random = Math.random();
  adbLogger.verbose('adb.getPidOf begin', { serial, appName, random });
  const cmdret = await shellIgnoreError(serial, `pidof ${appName}`, {}, printable);
  const rv = cmdret.stdout.trim();
  adbLogger.verbose('adb.getPidOf end', { serial, appName, random });
  return rv;
}

export async function getPackageInfoFromUid(serial: Serial, uid: number): Promise<PackageInfo> {
  const random = Math.random();
  adbLogger.verbose('adb.getPackageInfoFromUid begin', { serial, uid, random });
  const cmdret = await shellIgnoreError(serial, `ps -n | grep ${uid}`);
  const splited = parseRecord(cmdret.stdout);
  const rv = splited.length < 9 ? DefaultPackageInfo() : { pid: parseInt(splited[1]), uid: uid, name: splited[splited.length - 1] };
  adbLogger.verbose('adb.getPackageInfoFromUid end', { serial, uid, random });
  return rv;
}

export async function kill(serial: Serial, pid: string): Promise<string> {
  const random = Math.random();
  adbLogger.verbose('adb.kill begin', { serial, pid, random });
  const cmdret = await shellIgnoreError(serial, `kill ${pid}`);
  const rv = cmdret.stdout.trim();
  adbLogger.verbose('adb.kill end', { serial, pid, random });
  return rv;
}

export async function killPackage(serial: Serial, packageName: string): Promise<string> {
  const random = Math.random();
  adbLogger.verbose('adb.killPackage begin', { serial, packageName, random });
  const cmdret = await shellIgnoreError(serial, `am force-stop ${packageName}`);
  const rv = cmdret.stdout.trim();
  adbLogger.verbose('adb.killPackage end', { serial, packageName, random });
  return rv;
}

export async function killOnPort(serial: Serial, port: number): Promise<boolean> {
  const random = Math.random();
  adbLogger.verbose('adb.killOnPort begin', { serial, port, random });
  const packageInfo = await getPackageOnPort(serial, port);
  if (packageInfo.pid < 0) {
    adbLogger.verbose('adb.killOnPort end', { serial, port, rv: false, random });
    return false;
  }
  await killPackage(serial, packageInfo.name);
  adbLogger.verbose('adb.killOnPort end', { serial, port, rv: true, random });
  return true;
}

export async function runAppProcess(serial: Serial, localPath: string, destPath: string, main: string, printable: Printable): Promise<child_process.ChildProcess> {
  const random = Math.random();
  adbLogger.verbose('adb.runAppProcess begin', { serial, localPath, destPath, main, random });
  const pushret = await exec(`${adbPrefix()} -s ${serial} push ${localPath} ${destPath}`);
  const chmodRet = await exec(`${adbPrefix()} -s ${serial} shell chmod 777 ${destPath}`);
  const rv = await ChildProcess.spawn(
    adbBinary(),
    ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', `CLASSPATH=${destPath}`, 'app_process', '/', main],
    {},
    printable,
  );
  adbLogger.verbose('adb.runAppProcess end', { serial, localPath, destPath, main, random });
  return rv;
}

// device info
export async function serials(): Promise<DeviceScanResult[]> {
  const random = Math.random();
  adbLogger.verbose('adb.serials begin', { random });
  const output = (await execIgnoreError(`${adbPrefix()} devices`)).stdout;
  adbLogger.verbose('adb.serials', { output });
  const regex = /(\S+)/g;

  const stateToDeviceStatus = (state: string): DeviceScanStatus => {
    switch (state) {
      case 'device':
        return 'online';
      case 'offline':
        return 'offline';
      case 'unauthorized':
        return 'unauthorized';
      default:
        return 'unknown';
    }
  };

  const stateToDesciprtion = (state: string): string | undefined => {
    switch (state) {
      case 'device':
        return undefined;
      case 'offline':
        return `This device is offline as a result of the adb command. Please check the device status. Rebooting the device may fix it.`;
      case 'unauthorized':
        return 'Device is unauthorized. Please allow usb debugging.';
      default:
        return `Device status is unknown. ${state}`;
    }
  };

  const scanInfos = output
    .split('\n')
    .slice(1, -2)
    .map((serialAndStateLine) => {
      const matched = serialAndStateLine.match(regex);
      if (!matched || matched.length < 2) {
        return undefined;
      }
      const serial = matched[0];
      const state = matched[1];
      return { serial: serial, name: state, status: stateToDeviceStatus(state), description: stateToDesciprtion(state) } as DeviceScanResult;
    })
    .filter((deviceScanInfo) => deviceScanInfo !== undefined)
    .map((deviceScanInfo) => deviceScanInfo!);
  adbLogger.verbose('adb.serials end', { serials: scanInfos, random });
  return scanInfos;
}

export async function getProps(serial: Serial): Promise<AndroidPropInfo> {
  const random = Math.random();
  adbLogger.verbose('adb.getProps begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'getprop');
  const rv = parseAndroidShellProp(cmdret.stdout);
  adbLogger.verbose('adb.getProps end', { serial, random });
  return rv;
}

// Profile GPU Rendering (https://stackoverflow.com/questions/42492191/how-to-show-hide-profile-gpu-rendering-as-bars-using-adb-command)
export async function setProfileGPURendering(serial: Serial, value: string): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.setProfileGPURendering begin', { serial, value, random });
  await setProp(serial, 'debug.hwui.profile', value);
  adbLogger.verbose('adb.setProfileGPURendering end', { serial, value, random });
}

async function setProp(serial: Serial, propName: string, propValue: string): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.setProp begin', { serial, propName, propValue, random });
  await shell(serial, `setprop ${propName} ${propValue}`);
  adbLogger.verbose('adb.setProp end', { serial, propName, propValue, random });
}

export async function getProcCpuInfo(serial: Serial): Promise<AndroidProcCpuInfo[]> {
  const random = Math.random();
  adbLogger.verbose('adb.getProcCpuInfo begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'cat /proc/cpuinfo');
  const rv = parseAndroidProcCpuInfo(cmdret.stdout);
  adbLogger.verbose('adb.getProcCpuInfo end', { serial, random });
  return rv;
}

export async function getProcMemInfo(serial: Serial): Promise<AndroidProcMemInfo> {
  const random = Math.random();
  adbLogger.verbose('adb.getProcMemInfo begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'cat /proc/meminfo');
  const rv = parseAndroidProcMemInfo(cmdret.stdout);
  adbLogger.verbose('adb.getProcMemInfo end', { serial, random });
  return rv;
}

export async function getProcDiskstats(serial: Serial): Promise<AndroidProcDiskstats[]> {
  const random = Math.random();
  adbLogger.verbose('adb.getProcDiskstats begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'cat /proc/diskstats');
  const rv = parseAndroidProcDiskstats(cmdret.stdout);
  adbLogger.verbose('adb.getProcDiskstats end', { serial, random });
  return rv;
}

export async function getDfInfo(serial: Serial): Promise<AndroidDfInfo[]> {
  const random = Math.random();
  adbLogger.verbose('adb.getDfInfo begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'df');
  const rv = parseAndroidShellDf(cmdret.stdout);
  adbLogger.verbose('adb.getDfInfo end', { serial, random });
  return rv;
}

export async function getShellTopInfo(serial: Serial): Promise<AndroidShellTopInfo> {
  const random = Math.random();
  adbLogger.verbose('adb.getShellTopInfo begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'top -bn1');
  const rv = parseAndroidShellTop(cmdret.stdout);
  adbLogger.verbose('adb.getShellTopInfo end', { serial, random });
  return rv;
}

export interface FocusedAppInfo {
  displayId: number;
  packageName: string;
  activity: string;
}

export async function getForegroundPackage(serial: Serial): Promise<FocusedAppInfo[]> {
  const random = Math.random();
  adbLogger.verbose('adb.getForegroundPackage begin', { serial, random });
  const cmdret = await shellIgnoreError(serial, 'dumpsys input | grep -A10 FocusedApplication');
  const lines = cmdret.stdout.split('\n');
  const appLines: string[] = [];
  for (const l of lines) {
    const curL = l.replace('FocusedApplication:', '').trim();
    if (0 < curL.length) {
      appLines.push(curL);
    }
    if (l.includes('FocusedWindow')) {
      break;
    }
  }

  function parseActivityRecord(record: string): { packageName: string; activity: string } {
    const packageSlashActivity = record.split(' ')[2];
    const packageName = packageSlashActivity.split('/')[0];
    const activity = packageSlashActivity.split('/')[1];
    return {
      packageName: packageName,
      activity: activity,
    };
  }
  const ret: FocusedAppInfo[] = [];
  for (const appL of appLines) {
    const regex = /displayId=(?<id>[0-9]),.+ActivityRecord{(?<record>[^}]+)}/g;
    const match = regex.exec(appL);
    if (match && match.groups) {
      if ('id' in match.groups && 'record' in match.groups) {
        const id = match.groups.id;
        const { packageName, activity } = parseActivityRecord(match.groups.record);
        ret.push({
          displayId: Number(id),
          packageName: packageName,
          activity: activity,
        });
      }
    }
  }
  if (0 == ret.length) {
    for (const appL of appLines) {
      const regex = /ActivityRecord{(?<record>[^}]+)}/g;
      const match = regex.exec(appL);
      if (match && match.groups) {
        if ('record' in match.groups) {
          const { packageName, activity } = parseActivityRecord(match.groups.record);
          ret.push({
            displayId: 0,
            packageName: packageName,
            activity: activity,
          });
        }
      }
    }
  }
  adbLogger.verbose('adb.getForegroundPackage end', { serial, random });
  return ret;
}

const packageLinePattern = /^package:(?<packagePath>.*)=(?<packageName>.*)$/;

export interface InstalledPackage {
  packagePath: string;
  packageName: string;
}

export async function getIntalledPackages(serial: Serial, flags = ''): Promise<InstalledPackage[]> {
  const { stdout } = await shell(serial, `pm list packages -f ${flags}`);
  const installedPackages = stdout
    .split('\n')
    .map((line) => ({
      line: line.trim(),
      match: line.match(packageLinePattern),
    }))
    .filter(({ line, match }) => {
      if (!match) {
        adbLogger.warn(`Failed to match package line: ${line}`);
      }
      return !!match;
    })
    .map(({ line, match }) => ({ line, match } as { line: string; match: RegExpExecArray }))
    .filter(({ line, match }) => {
      if (!match.groups) {
        adbLogger.warn(`Failed to match groups in package line: ${line}`);
      }
      return !!match.groups;
    })
    .map(({ line, match }) => ({ line, groups: match.groups } as { line: string; groups: Record<string, string> }))
    .filter(({ line, groups }) => {
      if (!groups.packageName) {
        adbLogger.warn(`Failed to find package name in package line: ${line}`);
      }
      return !!groups.packageName;
    })
    .map(
      ({ line, groups }) =>
        ({
          packagePath: groups.packagePath,
          packageName: groups.packageName,
        } as InstalledPackage),
    );
  return installedPackages;
}

export async function getNonSystemIntalledPackages(serial: Serial): Promise<InstalledPackage[]> {
  return getIntalledPackages(serial, '-3');
}

const packageVersionLinePattern = /^\s*versionName=(?<versionName>.*)\s*$/;

export interface InstalledPackageQueryOptions {
  versionName?: boolean;
}

export interface InstalledPackageInfo {
  versionName?: string;
}

export async function getInstalledPackageInfo(serial: Serial, packageName: string, queryOptions: InstalledPackageQueryOptions): Promise<InstalledPackageInfo> {
  const { stdout } = await shell(serial, `dumpsys package ${packageName}`);
  const lines = stdout.split('\n');
  let foundPackagesLine = false;
  let foundPackageNameLine = false;
  const result: InstalledPackageInfo = {};
  lines.forEach((line) => {
    if (!foundPackagesLine) {
      if (line.startsWith('Packages:')) {
        foundPackagesLine = true;
      }
    }

    if (foundPackagesLine && !foundPackageNameLine) {
      if (line.startsWith(`  Package [${packageName}]`)) {
        foundPackageNameLine = true;
      }
    }

    if (foundPackagesLine && foundPackageNameLine) {
      if (queryOptions.versionName) {
        if (!result.versionName) {
          const match = line.match(packageVersionLinePattern);
          if (match && match.groups && match.groups.versionName) {
            result.versionName = match.groups.versionName;
          }
        }
      }
    }
  });
  return result;
}

// display

export async function isScreenOn(serial: Serial): Promise<boolean> {
  const random = Math.random();
  adbLogger.verbose('adb.isScreenOn begin', { serial, random });
  const result = await shellIgnoreError(serial, 'dumpsys input_method');
  const rv = result.stdout.includes('mInteractive=true');
  adbLogger.verbose('adb.isScreenOn end', { serial, random, rv });
  return rv;
}

export async function isDreamingLockScreen(serial: Serial): Promise<boolean> {
  const random = Math.random();
  adbLogger.verbose('adb.isDreamingLockScreen begin', { serial, random });
  const result = await shellIgnoreError(serial, 'dumpsys window | grep mDreamingLockscreen=true');
  const rv = result.stdout.includes('mDreamingLockscreen=true');
  adbLogger.verbose('adb.isDreamingLockScreen end', { serial, random, rv });
  return rv;
}

export async function turnOnScreen(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.turnOnScreen begin', { serial, random });
  const isTurnOff = !(await isScreenOn(serial));
  if (isTurnOff) {
    await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_WAKEUP);
    if (await isDreamingLockScreen(serial)) {
      await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU);
    }
  }
  adbLogger.verbose('adb.turnOnScreen end', { serial, random });
}

export async function turnOffScreen(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.turnOffScreen begin', { serial, random });
  const isTurnOn = await isScreenOn(serial);
  if (isTurnOn) {
    await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SLEEP);
  }
  adbLogger.verbose('adb.turnOffScreen end', { serial, random });
}

export async function keepScreenOn(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.keepScreenOn begin', { serial, random });
  await shellIgnoreError(serial, 'svc power stayon true');
  adbLogger.verbose('adb.keepScreenOn end', { serial, random });
}

export async function keepScreenOff(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.keepScreenOff begin', { serial, random });
  await shellIgnoreError(serial, 'svc power stayon false');
  adbLogger.verbose('adb.keepScreenOff end', { serial, random });
}

export async function keyevent(serial: Serial, keyEvent: DeviceControlKeycode): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.keyevent begin', { serial, random });
  await shellIgnoreError(serial, `input keyevent ${keyEvent}`);
  adbLogger.verbose('adb.keyevent end', { serial, random });
}

export async function getDisplaySize(serial: Serial): Promise<{ width: number; height: number }> {
  const random = Math.random();
  adbLogger.verbose('adb.getDisplaySize begin', { serial, random });
  const result = await shellIgnoreError(serial, 'wm size');
  // get adb shell wm output
  // Physical size: 1080x1920
  // Override size: 1080x1920
  const regex = /(\d+)x(\d+)/g;
  const matched = result.stdout.match(regex);
  if (matched === null) {
    return { width: 0, height: 0 };
  }
  const matchInfo = matched[0];
  if (matchInfo === undefined) {
    return { width: 0, height: 0 };
  }
  const [width, height] = matchInfo.split('x').map((v) => parseInt(v, 10));
  if (width === undefined) {
    return { width: 0, height: 0 };
  }
  if (height === undefined) {
    return { width: 0, height: 0 };
  }
  const rv = { width, height };
  adbLogger.verbose('adb.getDisplaySize end', { serial, random, rv });
  return rv;
}

export async function stayOnWhilePluggedIn(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.stayOnWhilePluggedIn begin', { serial, random });
  await shellIgnoreError(serial, 'settings put global stay_on_while_plugged_in 3');
  adbLogger.verbose('adb.stayOnWhilePluggedIn end', { serial, random });
}

// security
export async function unlock(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.unlock begin', { serial, random });
  await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU);
  await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ENTER);
  adbLogger.verbose('adb.unlock end', { serial, random });
}

export async function reboot(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.reboot begin', { serial, random });
  await commandIgnoreError(serial, 'reboot');
  adbLogger.verbose('adb.reboot end', { serial, random });
}

export async function reconnect(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.reconnect begin', { serial, random });
  await commandIgnoreError(serial, 'reconnect');
  await commandIgnoreError(serial, 'usb');
  adbLogger.verbose('adb.reconnect end', { serial, random });
}

export async function getTime(serial: Serial): Promise<string | undefined> {
  const random = Math.random();
  adbLogger.verbose('adb.getTime begin', { serial, random });
  try {
    const result = await shellIgnoreError(serial, `echo $(date +'%Y-%m-%d %H:%M:%S')`);
    return `${result.stdout.trim()}.000`;
  } catch (e) {
    return undefined;
  } finally {
    adbLogger.verbose('adb.getTime end', { serial, random });
  }
}

/**
 * FileSystem
 */

export async function readDir(serial: Serial, path: string): Promise<AndroidFileEntry[]> {
  const random = Math.random();
  adbLogger.verbose('adb.readDir begin', { serial, path, random });
  const result = await shellIgnoreError(serial, `ls -l "${path}"`);
  const rv = parseAndroidLs(result.stdout);
  adbLogger.verbose('adb.readDir end', { serial, path, random });
  return rv;
}

/**
 *  emulator
 *
 */

export async function getEmulatorName(serial: Serial): Promise<string> {
  const random = Math.random();
  adbLogger.verbose('adb.getEmulatorName begin', { serial, random });
  const result = await execIgnoreError(`${adbPrefix()} -s ${serial} emu avd name`);
  const lines = result.stdout.split('\n');
  if (lines.length < 1) {
    throw new Error(`Failed to get emulator name. ${result.stderr}`);
  }
  const rv = lines[0].trim();
  adbLogger.verbose('adb.getEmulatorName end', { serial, random, rv });
  return rv;
}

/**
 * @requires Android 10+
 * @note It takes about three minutes.
 * @link https://developer.android.com/tools/adb#test_harness
 */
export async function resetWithTestHarness(serial: Serial): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.resetWithTestHarness begin', { serial, random });
  return new Promise((resolve, reject) => {
    execFile(
      adbBinary(),
      ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', 'cmd', 'testharness', 'enable'],
      {
        encoding: 'utf8',
        timeout: 60 * 1000,
      },
      (error, stdout, stderr) => {
        if (error) {
          adbLogger.error('adb.resetWithTestHarness error', { serial, random, error: errorify(error) });
          reject(error);
        } else {
          adbLogger.verbose('adb.resetWithTestHarness stdout', { serial, random, stdout });
          adbLogger.verbose('adb.resetWithTestHarness stderr', { serial, random, stderr });
          adbLogger.verbose('adb.resetWithTestHarness end', { serial, random });
          resolve();
        }
      },
    );
  });
}

export async function resetManual(serial: Serial, logger: Printable): Promise<void> {
  const random = Math.random();
  adbLogger.verbose('adb.resetManual begin', { serial, random });
  const allApps = await getIntalledPackages(serial);
  const userApps = await getNonSystemIntalledPackages(serial);
  const promises = allApps.map(async (app): Promise<void> => {
    if (!userApps.find((targetApp) => targetApp.packageName === app.packageName)) {
      return;
    }
    await clearApp(serial, app.packageName, logger).catch((err) => {
      logger.error(`adb.resetManual failed to clear ${app.packageName}`, { error: stringify(err) });
    });
    await resetAppPermission(serial, app.packageName, logger).catch((err) => {
      logger.error(`adb.resetManual failed to reset permission ${app.packageName}`, { error: stringify(err) });
    });
    await uninstallApp(serial, app.packageName, false, logger).catch((err) => {
      logger.error(`adb.resetManual failed to uninstall ${app.packageName}`, { error: stringify(err) });
    });
    return Promise.resolve();
  });
  adbLogger.verbose('adb.resetManual end', { serial, random });
  await Promise.all(promises);

  const mkdirLists = ['Alarms', 'DCIM', 'Documents', 'Download', 'Movies', 'Music', 'Notifications', 'Pictures', 'Podcasts', 'Ringtones'];
  const files = await readDir(serial, '/storage/emulated/0');
  const promises2 = files.map(async (file): Promise<void> => {
    if (file.name === 'Android') {
      return Promise.resolve();
    }
    await shellIgnoreError(serial, `rm -rf /storage/emulated/0/${file.name}`).catch((err) => {
      logger.error(`adb.resetManual failed to remove directory ${file.name}`, { error: stringify(err) });
    });
    if (mkdirLists.includes(file.name)) {
      await shellIgnoreError(serial, `mkdir /storage/emulated/0/${file.name}`).catch((err) => {
        logger.error(`adb.resetManual failed to make directory ${file.name}`, { error: stringify(err) });
      });
    }
    return Promise.resolve();
  });
  await Promise.all(promises2);
  await logcatClear(serial, logger);

  await reboot(serial);
}

export interface AndroidSystemBarVisibility {
  /**
   * @default false
   */
  statusBar: boolean;

  /**
   * @default false
   */
  navigationBar: boolean;
}

export async function getSystemBarVisibility(serial: Serial): Promise<AndroidSystemBarVisibility> {
  /**
   * @example `  Window #5 Window{8926e0c u0 StatusBar}:`
   */
  const WindowPattern = /^\s+Window\s#\d+\sWindow\{\w+\s\w+\s(.+)\}:$/;

  /**
   * @example `    mHasSurface=true isReadyForDisplay()=true mWindowRemovalAllowed=false`
   */
  const VisibilityPattern = /^.*isReadyForDisplay\(\)=(true|false).*$/;

  /**
   * @example `StatusBar`
   */
  const StatusBarWindowNamePattern = /^StatusBar$/;

  /**
   * @example `NavigationBar` or `NavigationBar0`
   */
  const NavigationBarWindowNamePattern = /^NavigationBar\d*$/;

  const MaxWindowLineCount = 40;
  const StatusBarWindowName = 'StatusBar';
  const NavigationBarWindowName = 'NavigationBar';

  const findVisibility = (index: number, lines: string[]): boolean => {
    for (let i = index; i < index + MaxWindowLineCount; i++) {
      const visibilityMatch = lines[i].match(VisibilityPattern);
      if (visibilityMatch) {
        const visibility = visibilityMatch[1];
        return visibility === 'true';
      }
    }
    return false;
  };

  const temp = [
    {
      name: StatusBarWindowName,
      pattern: StatusBarWindowNamePattern,
      visibility: false,
    },
    {
      name: NavigationBarWindowName,
      pattern: NavigationBarWindowNamePattern,
      visibility: false,
    },
  ];

  const { stdout, stderr } = await execFileAsync(adbBinary(), ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', 'dumpsys', 'window', 'windows'], {
    timeout: 10 * 1000,
  });
  adbLogger.warn('adb.getSystemBarVisibilities', { serial, stderr });
  stdout.split('\n').forEach((line, index, lines) => {
    const windowMatch = line.match(WindowPattern);
    if (windowMatch) {
      const windowName = windowMatch[1];
      const target = temp.find((v) => windowName.match(v.pattern));
      if (target) {
        target.visibility = findVisibility(index, lines);
      }
    }
  });
  return {
    statusBar: temp.find((v) => v.name === StatusBarWindowName)?.visibility ?? false,
    navigationBar: temp.find((v) => v.name === NavigationBarWindowName)?.visibility ?? false,
  };
}

registerBootstrapHandler(
  __filename,
  async (): Promise<void> => {
    try {
      await fs.promises.chmod(adbBinary(), 0o777);
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(stringify(error));
      throw new Error(`Failed to chmod adb`, { cause });
    }
  },
  () => new PlatformAbility().isAndroidEnabled,
);
