import { PlatformAbility } from '@dogu-private/dost-children';
import { PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, errorify, IDisposableAsync, IDisposableSync, Printable, stringify, using, usingAsnyc } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import child_process, { execFile, ExecFileOptionsWithStringEncoding, spawn } from 'child_process';
import fs from 'fs';
import util from 'util';
import { registerBootstrapHandler } from '../../../../bootstrap/bootstrap.service';
import { env } from '../../../../env';
import { adbLogger } from '../../../../logger/logger.instance';
import { pathMap } from '../../../../path-map';
import { LogHandler } from '../../../public/device-channel';
import { DeviceScanResult, DeviceScanStatus } from '../../../public/device-driver';
import { parseRecord } from '../../../util/parse';
import { getManifestFromApp } from '../../apk/apk-util';
import { AndroidDfInfo, AndroidProcCpuInfo, AndroidProcDiskstats, AndroidProcMemInfo, AndroidPropInfo, AndroidShellTopInfo } from './info';
import {
  AndroidFileEntry,
  ImeInfo,
  parseAndroidLs,
  parseAndroidProcCpuInfo,
  parseAndroidProcDiskstats,
  parseAndroidProcMemInfo,
  parseAndroidShellDf,
  parseAndroidShellProp,
  parseAndroidShellTop,
  parseIMEList,
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

class AdbScope implements IDisposableSync, IDisposableAsync {
  public random: number;
  constructor(
    private func: { name: string },
    private option: {
      serial: Serial;
      [key: string]: any;
    },
  ) {
    this.random = Math.random();
    this.option.random = this.random;
  }
  create(): void {
    adbLogger.verbose(`adb.${this.func.name} begin`, this.option);
  }
  dispose(): void {
    adbLogger.verbose(`adb.${this.func.name} end`, this.option);
  }
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

/**
 * network
 */
export async function startServer(): Promise<void> {
  await exec(`${adbPrefix()} start-server`);
}

export async function killServer(): Promise<void> {
  await exec(`${adbPrefix()} kill-server`);
}

export async function forward(serial: Serial, hostPort: number, devicePort: number, printable: Printable = adbLogger): Promise<void> {
  await usingAsnyc(new AdbScope(forward, { serial, hostPort, devicePort }), async () => {
    await exec(`${adbPrefix()} -s ${serial} forward tcp:${hostPort} tcp:${devicePort}`);
    printable.verbose?.(`${serial} is forwarding from ${hostPort} to ${devicePort}`);
  });
}

export async function unforward(serial: Serial, hostPort: number, option?: { ignore: boolean }, printable: Printable = adbLogger): Promise<void> {
  await usingAsnyc(new AdbScope(unforward, { serial, hostPort }), async () => {
    let func = exec;
    if (option?.ignore) {
      func = execIgnoreError;
    }
    await func(`${adbPrefix()} -s ${serial} forward --remove tcp:${hostPort}`);
    printable.verbose?.(`${serial} is unforwarding from ${hostPort} to ${hostPort}`);
  });
}

export async function unforwardall(serial: Serial, printable: Printable = adbLogger): Promise<void> {
  await usingAsnyc(new AdbScope(unforwardall, { serial }), async () => {
    await exec(`${adbPrefix()} -s ${serial} forward --remove-all`);
  });
}

export async function logcatClear(serial: Serial, printable?: Printable): ReturnType<typeof ChildProcess.exec> {
  return await usingAsnyc(new AdbScope(logcatClear, { serial }), async () => {
    return await execIgnoreError(`${adbPrefix()} -s ${serial} logcat -c`, { timeout: 3 * 1000 }, printable);
  });
}

export function logcat(serial: Serial, args: string[], handler: LogHandler, printable?: Printable): child_process.ChildProcess {
  return using(new AdbScope(logcat, { serial }), () => {
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
    return child;
  });
}

export async function isPortOpen(serial: Serial, port: number, printable: Printable = adbLogger): Promise<boolean> {
  return await usingAsnyc(new AdbScope(isPortOpen, { serial, port }), async () => {
    const result = await shell(serial, `netstat -eanut | grep LISTEN | grep tcp | grep :${port}`).catch((e) => {
      const stringified = stringify(e);
      printable.verbose?.(`isPortOpen error`, { error: stringified });
      return { stdout: '', stderr: stringified };
    });
    const rv = result.stdout.length > 0;
    return rv;
  });
}

export async function getPackageOnPort(serial: Serial, port: number): Promise<PackageInfo> {
  return await usingAsnyc(new AdbScope(getPackageOnPort, { serial, port }), async () => {
    const result = await shellIgnoreError(serial, `netstat -eanut | grep LISTEN | grep tcp | grep :${port}`);
    const splited = parseRecord(result.stdout);
    if (splited.length < 7) {
      return DefaultPackageInfo();
    }
    const uid = parseInt(splited[6]);
    const rv = await getPackageInfoFromUid(serial, uid);
    return rv;
  });
}

/**
 * @note connect to wifi script
 * adb -s $DOGU_DEVICE_SERIAL install $DOGU_ADB_JOIN_WIFI_APK
 * adb -s $DOGU_DEVICE_SERIAL shell am start -n com.steinwurf.adbjoinwifi/.MainActivity -e ssid $DOGU_WIFI_SSID -e password_type WPA -e password $DOGU_WIFI_PASSWORD
 */

export async function joinWifi(serial: Serial, ssid: string, password: string, logger: Printable = adbLogger): Promise<void> {
  return await usingAsnyc(new AdbScope(joinWifi, { serial, ssid }), async () => {
    if (0 === ssid.length) {
      throw new Error(`AndroidSharedDeviceService.joinWifi failed. serial: ${serial}, ssid: ${ssid}`);
    }
    await installAppForce(serial, pathMap().common.adbJoinWifiApk);
    /**
     * @note Adb.Shell() is not used because password can remain in the log.
     */
    const appName = 'com.steinwurf.adbjoinwifi';
    await new Promise<void>((resolve, reject) => {
      execFile(
        HostPaths.android.adbPath(env.ANDROID_HOME),
        ['-s', serial, 'shell', `am start -n ${appName}/.MainActivity -e ssid ${ssid} -e password_type WPA -e password ${password}`],
        (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            logger.info(`AndroidSharedDeviceService.joinWifi stdout: ${stdout} stderr: ${stderr}`);
            resolve();
          }
        },
      );
    });
    let isWifiEnabled = false;
    for (let tryCount = 0; tryCount < 10; tryCount++) {
      const { stdout } = await shell(serial, 'dumpsys wifi', {
        windowsVerbatimArguments: true,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10,
      });
      if (stdout.includes('Wi-Fi is enabled')) {
        logger.info(`AndroidSharedDeviceService.joinWifi success. serial: ${serial}, ssid: ${ssid}`);
        isWifiEnabled = true;
        break;
      }
      await delay(3 * 1000);
    }
    if (!isWifiEnabled) {
      throw new Error(`AndroidSharedDeviceService.joinWifi failed. serial: ${serial}, ssid: ${ssid}`);
    }
    await shell(serial, `am force-stop ${appName}`).catch((error) => {
      logger.error('AndroidSharedDeviceService.joinWifi failed adb.joinWifi.force-stop', { error: errorify(error) });
    });
  });
}

/**
 * app control
 */

export async function uninstallApp(serial: Serial, appName: string, keep = false, printable: Printable = adbLogger): Promise<void> {
  return await usingAsnyc(new AdbScope(uninstallApp, { serial, appName, keep }), async () => {
    const command = ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'uninstall'];
    if (keep) {
      command.push('-k');
    }
    command.push(appName);
    await ChildProcess.spawnAndWait(adbBinary(), command, { timeout: 60000 * 5 }, printable).catch((err) => {
      printable.error?.(`ChildProcess.uninstallApp failed`, { error: stringify(err) });
      return;
    });
  });
}

export async function clearApp(serial: Serial, appName: string, printable: Printable = adbLogger): Promise<void> {
  return await usingAsnyc(new AdbScope(clearApp, { serial, appName }), async () => {
    const command = ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', 'pm', 'clear', appName];
    await ChildProcess.spawnAndWait(adbBinary(), command, { timeout: 60000 * 5 }, printable).catch((err) => {
      printable.error?.(`ChildProcess.clearApp failed`, { error: stringify(err) });
      return;
    });
  });
}

export async function resetAppPermission(serial: Serial, appName: string, printable: Printable = adbLogger): Promise<void> {
  return await usingAsnyc(new AdbScope(resetAppPermission, { serial, appName }), async () => {
    const command = ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', 'pm', 'reset-permissions', appName];
    await ChildProcess.spawnAndWait(adbBinary(), command, { timeout: 60000 * 5 }, printable).catch((err) => {
      printable.error?.(`ChildProcess.resetAppPermission failed`, { error: stringify(err) });
      return;
    });
  });
}

function installAppArgsInternal(serial: Serial, apkPath: string): { command: string; args: string[] } {
  return { command: adbBinary(), args: ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'install', '-r', '-d', '-t', '-g', apkPath] };
}

export async function installApp(serial: Serial, apkPath: string, printable: Printable = adbLogger): Promise<child_process.ChildProcess> {
  return await usingAsnyc(new AdbScope(installApp, { serial, apkPath }), async () => {
    const { command, args } = installAppArgsInternal(serial, apkPath);
    const rv = await ChildProcess.spawnAndWait(command, args, { timeout: 60000 * 5 }, printable);
    return rv;
  });
}

/**
 * @note if install failed with INSTALL_FAILED_UPDATE_INCOMPATIBLE then uninstall with keep data and install again
 */
export async function installAppForce(serial: string, appPath: string, printable?: Printable): Promise<void> {
  return await usingAsnyc(new AdbScope(installAppForce, { serial, appPath }), async () => {
    const logger = printable ?? adbLogger;
    logger.info(`installing app: ${appPath}`);
    const stat = await fs.promises.stat(appPath).catch(() => null);
    if (!stat) {
      throw new Error(`app not found: ${appPath}`);
    } else {
      logger.info(`app size: ${stat.size}`);
    }
    const { error, stdout, stderr } = await installAppWithReturningStdoutStderr(serial, appPath, 5 * 60 * 1000, logger)
      .then(({ stdout, stderr }) => {
        return { error: null, stdout, stderr };
      })
      .catch((error) => {
        return { error: errorify(error), stdout: '', stderr: '' };
      });
    const FallbackKeyward = 'INSTALL_FAILED_UPDATE_INCOMPATIBLE';
    const hasFallbackKeyward = stringify(error).includes(FallbackKeyward) || stdout.includes(FallbackKeyward) || stderr.includes(FallbackKeyward);
    if (!hasFallbackKeyward) {
      if (error) {
        throw error;
      } else {
        if (stdout) {
          logger.info(`adb install stdout: ${stdout}`);
        }
        if (stderr) {
          logger.info(`adb install stderr: ${stderr}`);
        }
        return;
      }
    }
    logger.info(`adb install failed with ${FallbackKeyward}. uninstall with keep data and install again`);
    const menifest = await getManifestFromApp(appPath);
    if (!menifest.package) {
      throw new Error(`Unexpected value. app path: ${appPath}, ${stringify(menifest)}`);
    }
    await uninstallApp(serial, menifest.package, true, logger);
    await installApp(serial, appPath, logger);
  });
}

async function installAppWithReturningStdoutStderr(serial: Serial, apkPath: string, timeout: number, printable: Printable): Promise<ChildProcess.ExecResult> {
  return await usingAsnyc(new AdbScope(installAppWithReturningStdoutStderr, { serial, apkPath }), async () => {
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
    return rv;
  });
}

export async function runApp(serial: Serial, packageName: string, launchableActivityName: string, printable: Printable = adbLogger): Promise<child_process.ChildProcess> {
  return await usingAsnyc(new AdbScope(runApp, { serial, packageName }), async () => {
    const rv = await ChildProcess.spawnAndWait(
      adbBinary(),
      ['-P', `${DOGU_ADB_SERVER_PORT}`, '-s', serial, 'shell', 'am', 'start', '-e', 'testkey', 'testvalue', '-n', `${packageName}/${launchableActivityName}`],
      {},
      printable,
    );
    return rv;
  });
}

export async function runActivity(serial: Serial, activityName: string, printable: Printable = adbLogger): Promise<child_process.ChildProcess> {
  return await usingAsnyc(new AdbScope(runActivity, { serial, activityName }), async () => {
    const rv = await ChildProcess.spawnAndWait(adbBinary(), ['-P', `${DOGU_ADB_SERVER_PORT}`, '-s', serial, 'shell', 'am', 'start', '-a', `${activityName}`], {}, printable);
    return rv;
  });
}

export async function getPidOf(serial: Serial, appName: string, printable?: Printable): Promise<string> {
  return await usingAsnyc(new AdbScope(getPidOf, { serial, appName }), async () => {
    const cmdret = await shellIgnoreError(serial, `pidof ${appName}`, {}, printable);
    const rv = cmdret.stdout.trim();
    return rv;
  });
}

export async function getPackageInfoFromUid(serial: Serial, uid: number): Promise<PackageInfo> {
  return await usingAsnyc(new AdbScope(getPackageInfoFromUid, { serial, uid }), async () => {
    const cmdret = await shellIgnoreError(serial, `ps -n | grep ${uid}`);
    const splited = parseRecord(cmdret.stdout);
    const rv = splited.length < 9 ? DefaultPackageInfo() : { pid: parseInt(splited[1]), uid: uid, name: splited[splited.length - 1] };
    return rv;
  });
}

export async function kill(serial: Serial, pid: string): Promise<string> {
  return await usingAsnyc(new AdbScope(kill, { serial, pid }), async () => {
    const cmdret = await shellIgnoreError(serial, `kill ${pid}`);
    const rv = cmdret.stdout.trim();
    return rv;
  });
}

export async function killPackage(serial: Serial, packageName: string): Promise<string> {
  return await usingAsnyc(new AdbScope(killPackage, { serial, packageName }), async () => {
    const cmdret = await shellIgnoreError(serial, `am force-stop ${packageName}`);
    const rv = cmdret.stdout.trim();
    return rv;
  });
}

export async function killOnPort(serial: Serial, port: number): Promise<boolean> {
  return await usingAsnyc(new AdbScope(killOnPort, { serial, port }), async () => {
    const packageInfo = await getPackageOnPort(serial, port);
    if (packageInfo.pid < 0) {
      adbLogger.verbose('adb.killOnPort end', { serial, port, rv: false });
      return false;
    }
    await killPackage(serial, packageInfo.name);
    return true;
  });
}

export async function runAppProcess(serial: Serial, localPath: string, destPath: string, main: string, printable: Printable): Promise<child_process.ChildProcess> {
  return await usingAsnyc(new AdbScope(runAppProcess, { serial, localPath, destPath }), async () => {
    const pushret = await exec(`${adbPrefix()} -s ${serial} push ${localPath} ${destPath}`);
    const chmodRet = await exec(`${adbPrefix()} -s ${serial} shell chmod 777 ${destPath}`);
    const rv = await ChildProcess.spawn(
      adbBinary(),
      ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'shell', `CLASSPATH=${destPath}`, 'app_process', '/', main],
      {},
      printable,
    );
    return rv;
  });
}

export async function disablePackage(serial: Serial, packageName: string, userId: number, printable: Printable): Promise<void> {
  return await usingAsnyc(new AdbScope(disablePackage, { serial, packageName }), async () => {
    await shellIgnoreError(serial, `pm disable-user ${userId} ${packageName}`);
    await shellIgnoreError(serial, `pm disable-user ${packageName}`);
  });
}

export async function disableGooglePlayProtect(serial: Serial, printable: Printable): Promise<void> {
  return await usingAsnyc(new AdbScope(disableGooglePlayProtect, { serial }), async () => {
    await shellIgnoreError(serial, `settings put global package_verifier_user_consent -1`);
  });
}

export async function allowNonMarketApps(serial: Serial, printable: Printable): Promise<void> {
  return await usingAsnyc(new AdbScope(allowNonMarketApps, { serial }), async () => {
    await shellIgnoreError(
      serial,
      `settings put global install_non_market_apps 1
  `,
    );
  });
}

/**
 * device info
 */
export async function serials(): Promise<DeviceScanResult[]> {
  return await usingAsnyc(new AdbScope(serials, { serial: '0' }), async () => {
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
    return scanInfos;
  });
}

export async function getProps(serial: Serial): Promise<AndroidPropInfo> {
  return await usingAsnyc(new AdbScope(getProps, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, 'getprop');
    const rv = parseAndroidShellProp(cmdret.stdout);
    return rv;
  });
}

export async function getProp(serial: Serial, key: string): Promise<string> {
  return await usingAsnyc(new AdbScope(getProp, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, `getprop ${key}`);
    return cmdret.stdout;
  });
}

// Profile GPU Rendering (https://stackoverflow.com/questions/42492191/how-to-show-hide-profile-gpu-rendering-as-bars-using-adb-command)
export async function setProfileGPURendering(serial: Serial, value: string): Promise<void> {
  return await usingAsnyc(new AdbScope(setProfileGPURendering, { serial, value }), async () => {
    await setProp(serial, 'debug.hwui.profile', value);
  });
}

export async function setProp(serial: Serial, propName: string, propValue: string): Promise<void> {
  return await usingAsnyc(new AdbScope(setProp, { serial, propName, propValue }), async () => {
    await shell(serial, `setprop ${propName} ${propValue}`);
  });
}

export async function getProcCpuInfo(serial: Serial): Promise<AndroidProcCpuInfo[]> {
  return await usingAsnyc(new AdbScope(getProcCpuInfo, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, 'cat /proc/cpuinfo');
    const rv = parseAndroidProcCpuInfo(cmdret.stdout);
    return rv;
  });
}

export async function getProcMemInfo(serial: Serial): Promise<AndroidProcMemInfo> {
  return await usingAsnyc(new AdbScope(getProcMemInfo, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, 'cat /proc/meminfo');
    const rv = parseAndroidProcMemInfo(cmdret.stdout);
    return rv;
  });
}

export async function getProcDiskstats(serial: Serial): Promise<AndroidProcDiskstats[]> {
  return await usingAsnyc(new AdbScope(getProcDiskstats, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, 'cat /proc/diskstats');
    const rv = parseAndroidProcDiskstats(cmdret.stdout);
    return rv;
  });
}

export async function getDfInfo(serial: Serial): Promise<AndroidDfInfo[]> {
  return await usingAsnyc(new AdbScope(getDfInfo, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, 'df');
    const rv = parseAndroidShellDf(cmdret.stdout);
    return rv;
  });
}

export async function getShellTopInfo(serial: Serial): Promise<AndroidShellTopInfo> {
  return await usingAsnyc(new AdbScope(getShellTopInfo, { serial }), async () => {
    const cmdret = await shellIgnoreError(serial, 'top -bn1');
    const rv = parseAndroidShellTop(cmdret.stdout);
    return rv;
  });
}

export interface FocusedAppInfo {
  displayId: number;
  packageName: string;
  activity: string;
}

export async function getForegroundPackage(serial: Serial): Promise<FocusedAppInfo[]> {
  return await usingAsnyc(new AdbScope(getForegroundPackage, { serial }), async () => {
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
    return ret;
  });
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

export async function getIMEList(serial: Serial): Promise<ImeInfo[]> {
  return await usingAsnyc(new AdbScope(getIMEList, { serial }), async () => {
    const { stdout } = await shell(serial, `ime list -a`);
    const ret = parseIMEList(stdout);
    return ret;
  });
}

/*
 * ref: https://stackoverflow.com/a/33480790
 */
export async function putIMESecure(serial: Serial, ime: ImeInfo): Promise<void> {
  return await usingAsnyc(new AdbScope(putIMESecure, { serial, ime }), async () => {
    await shell(serial, `settings put secure enabled_input_methods ${ime.packageName}/${ime.service}`);
  });
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

/**
 * display
 */

export async function isScreenOn(serial: Serial): Promise<boolean> {
  return await usingAsnyc(new AdbScope(isScreenOn, { serial }), async () => {
    const result = await shellIgnoreError(serial, 'dumpsys input_method');
    const rv = result.stdout.includes('mInteractive=true');
    return rv;
  });
}

export async function isDreamingLockScreen(serial: Serial): Promise<boolean> {
  return await usingAsnyc(new AdbScope(isDreamingLockScreen, { serial }), async () => {
    const result = await shellIgnoreError(serial, 'dumpsys window | grep mDreamingLockscreen=true');
    const rv = result.stdout.includes('mDreamingLockscreen=true');
    return rv;
  });
}

export async function turnOnScreen(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(turnOnScreen, { serial }), async () => {
    const isTurnOff = !(await isScreenOn(serial));
    if (isTurnOff) {
      await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_WAKEUP);
      if (await isDreamingLockScreen(serial)) {
        await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU);
      }
    }
  });
}

export async function turnOffScreen(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(turnOffScreen, { serial }), async () => {
    const random = Math.random();
    adbLogger.verbose('adb.turnOffScreen begin', { serial, random });
    const isTurnOn = await isScreenOn(serial);
    if (isTurnOn) {
      await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SLEEP);
    }
    adbLogger.verbose('adb.turnOffScreen end', { serial, random });
  });
}

export async function keepScreenOn(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(keepScreenOn, { serial }), async () => {
    await shellIgnoreError(serial, 'svc power stayon true');
  });
}

export async function keepScreenOff(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(keepScreenOff, { serial }), async () => {
    await shellIgnoreError(serial, 'svc power stayon false');
  });
}

export async function keyevent(serial: Serial, keyEvent: DeviceControlKeycode): Promise<void> {
  return await usingAsnyc(new AdbScope(keyevent, { serial, keyevent }), async () => {
    await shellIgnoreError(serial, `input keyevent ${keyEvent}`);
  });
}

export async function getDisplaySize(serial: Serial): Promise<{ width: number; height: number }> {
  return await usingAsnyc(new AdbScope(getDisplaySize, { serial }), async () => {
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
    return rv;
  });
}

export async function stayOnWhilePluggedIn(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(stayOnWhilePluggedIn, { serial }), async () => {
    await shellIgnoreError(serial, 'settings put global stay_on_while_plugged_in 3');
  });
}

export type AdbBrightness = 0 | 50 | 100 | 150 | 200 | 255;

export async function setBrightness(serial: Serial, value: number): Promise<void> {
  return await usingAsnyc(new AdbScope(setBrightness, { serial, value }), async () => {
    await shellIgnoreError(serial, `settings put system screen_brightness ${value}`);
  });
}

/**
 *  security
 */
export async function unlock(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(unlock, { serial }), async () => {
    await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU);
    await keyevent(serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ENTER);
  });
}

export async function reboot(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(reboot, { serial }), async () => {
    const random = Math.random();
    adbLogger.verbose('adb.reboot begin', { serial, random });
    await commandIgnoreError(serial, 'reboot');
    adbLogger.verbose('adb.reboot end', { serial, random });
  });
}

export async function reconnect(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(reconnect, { serial }), async () => {
    await commandIgnoreError(serial, 'reconnect');
    await commandIgnoreError(serial, 'usb');
  });
}

export async function getTime(serial: Serial): Promise<string | undefined> {
  return await usingAsnyc(new AdbScope(getTime, { serial }), async () => {
    try {
      const result = await shellIgnoreError(serial, `echo $(date +'%Y-%m-%d %H:%M:%S')`);
      return `${result.stdout.trim()}.000`;
    } catch (e) {
      return undefined;
    }
  });
}

export async function getUptimeSeconds(serial: Serial): Promise<number | undefined> {
  return await usingAsnyc(new AdbScope(getUptimeSeconds, { serial }), async () => {
    try {
      const result = await shellIgnoreError(serial, 'cat /proc/uptime');
      const uptime = result.stdout.split(' ')[0];
      const uptimeSeconds = parseFloat(uptime);
      return uptimeSeconds;
    } catch (e) {
      return undefined;
    }
  });
}

/**
 * FileSystem
 */

export async function readDir(serial: Serial, path: string): Promise<AndroidFileEntry[]> {
  return await usingAsnyc(new AdbScope(readDir, { serial, path }), async () => {
    const result = await shellIgnoreError(serial, `ls -l "${path}"`);
    const rv = parseAndroidLs(result.stdout);
    return rv;
  });
}

/**
 *  emulator
 *
 */

export async function getEmulatorName(serial: Serial): Promise<string> {
  return await usingAsnyc(new AdbScope(getEmulatorName, { serial }), async () => {
    const result = await execIgnoreError(`${adbPrefix()} -s ${serial} emu avd name`);
    const lines = result.stdout.split('\n');
    if (lines.length < 1) {
      throw new Error(`Failed to get emulator name. ${result.stderr}`);
    }
    const rv = lines[0].trim();
    return rv;
  });
}

/**
 * reset
 *
 */

/**
 * @requires Android 10+
 * @note It takes about three minutes.
 * @link https://developer.android.com/tools/adb#test_harness
 */
export async function enableTestharness(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(enableTestharness, { serial }), async (scope: AdbScope) => {
    const { random } = scope;
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
            adbLogger.error('adb.enableTestharness error', { serial, random, error: errorify(error) });
            reject(error);
          } else {
            adbLogger.verbose('adb.enableTestharness stdout', { serial, random, stdout });
            adbLogger.verbose('adb.enableTestharness stderr', { serial, random, stderr });
            resolve();
          }
        },
      );
    });
  });
}

export async function resetPackages(serial: Serial, ignorePackages: string[], logger: Printable): Promise<void> {
  return await usingAsnyc(new AdbScope(resetPackages, { serial, ignorePackages }), async (scope: AdbScope) => {
    const { random } = scope;
    const allApps = await getIntalledPackages(serial);
    const userApps = await getNonSystemIntalledPackages(serial);
    const promises = allApps.map(async (app): Promise<void> => {
      if (!userApps.find((targetApp) => targetApp.packageName === app.packageName)) {
        return;
      }
      if (ignorePackages.includes(app.packageName)) {
        return;
      }
      await clearApp(serial, app.packageName, logger).catch((err) => {
        logger.error(`adb.resetPackages failed to clear`, { error: stringify(err), package: app.packageName, serial, random });
      });
      await uninstallApp(serial, app.packageName, false, logger).catch((err) => {
        logger.error(`adb.resetPackages failed to uninstall`, { error: stringify(err), package: app.packageName, serial, random });
      });
      return Promise.resolve();
    });
    await Promise.all(promises);
  });
}

export async function resetSdcard(serial: Serial, logger: Printable): Promise<void> {
  return await usingAsnyc(new AdbScope(resetSdcard, { serial }), async (scope: AdbScope) => {
    const { random } = scope;
    const mkdirLists = ['Alarms', 'DCIM', 'Documents', 'Download', 'Movies', 'Music', 'Notifications', 'Pictures', 'Podcasts', 'Ringtones'];
    const files = await readDir(serial, '/storage/emulated/0');
    const promises = files.map(async (file): Promise<void> => {
      let dirPath = `/storage/emulated/0/${file.name}`;
      if (file.name === 'Android') {
        dirPath = `/storage/emulated/0/Android/data`;
      }
      await shellIgnoreError(serial, `rm -rf ${dirPath}`).catch((err) => {
        logger.error(`adb.resetSdcard failed to remove directory`, { error: stringify(err), path: dirPath, serial, random });
      });
      if (mkdirLists.includes(file.name)) {
        await shellIgnoreError(serial, `mkdir ${dirPath}`).catch((err) => {
          logger.error(`adb.resetSdcard failed to make directory`, { error: stringify(err), path: dirPath, serial, random });
        });
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  });
}

/*
 * Does this works?
 */
export async function resetIME(serial: Serial): Promise<void> {
  return await usingAsnyc(new AdbScope(resetIME, { serial }), async () => {
    await shell(serial, `ime reset`);
  });
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
