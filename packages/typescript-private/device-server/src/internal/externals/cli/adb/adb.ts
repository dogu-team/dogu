import { PlatformAbility } from '@dogu-private/dost-children';
import { GeoLocation, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, errorify, FilledPrintable, IDisposableAsync, IDisposableSync, Printable, retry, Retry, stringify, using, usingAsnyc } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import child_process, { execFile, ExecFileOptionsWithStringEncoding, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import util from 'util';
import { registerBootstrapHandler } from '../../../../bootstrap/bootstrap.service';
import { env } from '../../../../env';
import { adbLogger } from '../../../../logger/logger.instance';
import { createAdbSerialLogger, SerialLogger } from '../../../../logger/serial-logger.instance';
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
    private funcName: string,
    private option: {
      [key: string]: any;
    },
  ) {
    this.random = Math.random();
    this.option.random = this.random;
  }
  create(): void {
    adbLogger.verbose(`adb.${this.funcName} begin`, this.option);
  }
  dispose(): void {
    adbLogger.verbose(`adb.${this.funcName} end`, this.option);
  }
}

class AdbSerialScope implements IDisposableSync, IDisposableAsync {
  static loggers: Map<Serial, SerialLogger> = new Map();
  public random: number;
  private logger: SerialLogger;
  private startTime: number | undefined;
  constructor(
    private funcName: string,
    private option: {
      serial: Serial;
      [key: string]: any;
    },
  ) {
    if (!AdbSerialScope.loggers.has(option.serial)) {
      AdbSerialScope.loggers.set(option.serial, createAdbSerialLogger(option.serial));
    }
    this.logger = AdbSerialScope.loggers.get(option.serial) ?? createAdbSerialLogger(option.serial);
    this.random = Math.random();
    this.option.random = this.random;
  }
  create(): void {
    this.startTime = Date.now();
    this.logger.verbose(`adb.${this.funcName} begin`, this.option);
  }
  dispose(): void {
    if (this.startTime) {
      this.option.duration = Date.now() - this.startTime;
    }
    this.logger.verbose(`adb.${this.funcName} end`, this.option);
  }
}

interface AdbExecOption {
  execOption?: child_process.ExecOptions;
  printable: Printable;
}

const execFileAsync = util.promisify(execFile);

type DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;

async function exec(command: string): ReturnType<typeof ChildProcess.exec> {
  return ChildProcess.exec(command, {});
}

async function execIgnoreError(command: string, option: AdbExecOption): ReturnType<typeof ChildProcess.execIgnoreError> {
  return ChildProcess.execIgnoreError(command, {}, option.printable);
}

async function commandIgnoreError(serial: Serial, command: string, option: AdbExecOption): ReturnType<typeof ChildProcess.execIgnoreError> {
  return execIgnoreError(`${adbPrefix()} -s ${serial} ${command}`, option);
}

export async function shell(
  serial: Serial,
  command: string,
  options: ExecFileOptionsWithStringEncoding = {
    windowsVerbatimArguments: true,
    encoding: 'utf8',
  },
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

async function shellIgnoreError(serial: Serial, command: string, option: AdbExecOption): ReturnType<typeof ChildProcess.execIgnoreError> {
  return execIgnoreError(`${adbPrefix()} -s ${serial} shell "${command}"`, option);
}

interface ForwardInfo {
  serial: Serial;
  hostProtocol: string;
  hostValue: string;
  deviceProtocol: string;
  deviceValue: string;
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

interface DisplayDeviceInfo {
  width: number;
  height: number;
}

export interface FocusedAppInfo {
  displayId: number;
  packageName: string;
  activity: string;
}

const packageLinePattern = /^package:(?<packagePath>.*)=(?<packageName>.*)$/;

export interface InstalledPackage {
  packagePath: string;
  packageName: string;
}

const packageVersionLinePattern = /^\s*versionName=(?<versionName>.*)\s*$/;

export interface InstalledPackageQueryOptions {
  versionName?: boolean;
}

export interface InstalledPackageInfo {
  versionName?: string;
}

export type AdbBrightness = 0 | 50 | 100 | 150 | 200 | 255;

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

export module Adb {
  export async function startServer(): Promise<void> {
    await exec(`${adbPrefix()} start-server`);
  }

  export async function killServer(): Promise<void> {
    await exec(`${adbPrefix()} kill-server`);
  }

  export async function serials(): Promise<DeviceScanResult[]> {
    return await usingAsnyc(new AdbScope('serials', {}), async () => {
      const output = (await execIgnoreError(`${adbPrefix()} devices`, { printable: adbLogger })).stdout;
      adbLogger.verbose('adb.serials', { output });
      const regex = /(\S+)/g;

      const stateToDeviceStatus = (state: string): DeviceScanStatus => {
        switch (state) {
          case 'device':
            return 'online';
          default:
            return 'unstable';
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
        .split(os.EOL)
        .slice(1, -2)
        .map((serialAndStateLine) => {
          const matched = serialAndStateLine.match(regex);
          if (!matched || matched.length < 2) {
            return undefined;
          }
          const serial = matched[0];
          const state = matched[1];
          return { serial, name: state, status: stateToDeviceStatus(state), description: stateToDesciprtion(state) } as DeviceScanResult;
        })
        .filter((deviceScanInfo) => deviceScanInfo !== undefined)
        .map((deviceScanInfo) => deviceScanInfo!);
      return scanInfos;
    });
  }

  export async function listForward(): Promise<ForwardInfo[]> {
    return await usingAsnyc(new AdbScope('listForward', {}), async () => {
      const ret = await exec(`${adbPrefix()} forward --list`);
      const lines = ret.stdout.split(os.EOL);
      const rv = lines.map((line) => {
        const splited = line.split(/\s{1,}|\t/);
        if (splited.length < 3) {
          return undefined;
        }
        const [serial, hostNet, deviceNet] = splited;
        const hostNetSplited = hostNet.split(':');
        const deviceNetSplited = deviceNet.split(':');
        if (hostNetSplited.length < 2 || deviceNetSplited.length < 2) {
          return undefined;
        }
        const hostProtocol = hostNetSplited[0];
        const hostValue = hostNetSplited[1];
        const deviceProtocol = deviceNetSplited[0];
        const deviceValue = deviceNetSplited[1];
        return { serial, hostProtocol, hostValue, deviceProtocol, deviceValue };
      });
      return rv.filter((v) => v !== undefined) as ForwardInfo[];
    });
  }
}

export class AdbSerial {
  constructor(
    public serial: Serial,
    public printable: FilledPrintable,
  ) {}

  async shell(command: string): ReturnType<typeof ChildProcess.exec> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('shell', { serial, command }), async () => {
      return await shell(this.serial, command);
    });
  }

  async shellIgnoreError(command: string): ReturnType<typeof ChildProcess.execIgnoreError> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('shell', { serial, command }), async () => {
      return await shellIgnoreError(this.serial, command, { printable: this.printable });
    });
  }

  //#region network

  async forward(hostPort: number, devicePort: number): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('forward', { serial, hostPort, devicePort }), async () => {
      await exec(`${adbPrefix()} -s ${serial} forward tcp:${hostPort} tcp:${devicePort}`);
      printable.verbose?.(`${serial} is forwarding from ${hostPort} to ${devicePort}`);
    });
  }

  async unforward(hostPort: number, option: { ignore: boolean }): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('unforward', { serial, hostPort }), async () => {
      if (option?.ignore) {
        await execIgnoreError(`${adbPrefix()} -s ${serial} forward --remove tcp:${hostPort}`, { printable });
      } else {
        await exec(`${adbPrefix()} -s ${serial} forward --remove tcp:${hostPort}`);
      }
      printable.verbose?.(`${serial} is unforwarding from ${hostPort} to ${hostPort}`);
    });
  }

  async unforwardall(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('unforwardall', { serial }), async () => {
      const forwardList = await Adb.listForward();
      for (const forward of forwardList) {
        if (forward.serial !== serial) {
          continue;
        }
        const value = parseInt(forward.hostValue);
        if (isNaN(value)) {
          continue;
        }

        await this.unforward(value, { ignore: true });
      }
    });
  }

  async logcatClear(): ReturnType<typeof ChildProcess.exec> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('logcatClear', { serial }), async () => {
      return await execIgnoreError(`${adbPrefix()} -s ${serial} logcat -c`, { execOption: { timeout: 3 * 1000 }, printable });
    });
  }

  logcat(args: string[], handler: LogHandler): child_process.ChildProcess {
    const { serial } = this;
    return using(new AdbSerialScope('logcat', { serial }), () => {
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

  async isPortOpen(port: number): Promise<boolean> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('isPortOpen', { serial, port }), async () => {
      const result = await shell(serial, `netstat -eanut | grep LISTEN | grep tcp | grep :${port}`).catch((e) => {
        const stringified = stringify(e);
        printable.verbose?.(`isPortOpen error`, { error: stringified });
        return { stdout: '', stderr: stringified };
      });
      const rv = result.stdout.length > 0;
      return rv;
    });
  }

  async waitPortOpenInternal(port: number): Promise<void> {
    for (let i = 0; i < 10; ++i) {
      if (await this.isPortOpen(port)) return;
      await delay(1000);
    }

    throw new Error('adb.waitPortOpen timeout');
  }

  async getPackageOnPort(port: number): Promise<PackageInfo> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getPackageOnPort', { serial, port }), async () => {
      const result = await shellIgnoreError(serial, `netstat -eanut | grep LISTEN | grep tcp | grep :${port}`, { printable });
      const splited = parseRecord(result.stdout);
      if (splited.length < 7) {
        return DefaultPackageInfo();
      }
      const uid = parseInt(splited[6]);
      const rv = await this.getPackageInfoFromUid(uid);
      return rv;
    });
  }

  /**
   * @note connect to wifi script
   * adb -s $DOGU_DEVICE_SERIAL install $DOGU_ADB_JOIN_WIFI_APK
   * adb -s $DOGU_DEVICE_SERIAL shell am start -n com.steinwurf.adbjoinwifi/.MainActivity -e ssid $DOGU_WIFI_SSID -e password_type WPA -e password $DOGU_WIFI_PASSWORD
   */

  async joinWifi(ssid: string, password: string): Promise<void> {
    const { serial, printable: logger } = this;
    return await usingAsnyc(new AdbSerialScope('joinWifi', { serial, ssid }), async () => {
      if (0 === ssid.length) {
        throw new Error(`AndroidSharedDeviceService.joinWifi failed. serial: ${serial}, ssid: ${ssid}`);
      }
      await this.installAppForce(pathMap().common.adbJoinWifiApk);
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

  @Retry({ retryCount: 3, retryInterval: 300 })
  async enableBluetooth(): Promise<void> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('enableBluetooth', { serial }), async () => {
      await shell(serial, `cmd bluetooth_manager enable`);
    });
  }

  @Retry({ retryCount: 3, retryInterval: 300 })
  async disableBluetooth(): Promise<void> {
    const { serial } = this;
    return retry(async () => {
      return await usingAsnyc(new AdbSerialScope('disableBluetooth', { serial }), async () => {
        await shell(serial, `cmd bluetooth_manager disable`);
      });
    });
  }
  //#endregion

  //#region app control

  @Retry({ retryCount: 3, retryInterval: 1000 })
  async uninstallApp(appName: string, keep = false): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('uninstallApp', { serial, appName, keep }), async () => {
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

  @Retry({ retryCount: 3, retryInterval: 1000 })
  async clearApp(appName: string): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('clearApp', { serial, appName }), async () => {
      await shell(serial, `pm clear ${appName}`);
    });
  }

  async resetAppPermission(appName: string): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('resetAppPermission', { serial, appName }), async () => {
      await shell(serial, `pm reset-permissions ${appName}`);
    });
  }

  installAppArgsInternal(apkPath: string): { command: string; args: string[] } {
    const { serial } = this;
    return { command: adbBinary(), args: ['-P', DOGU_ADB_SERVER_PORT.toString(), '-s', serial, 'install', '-r', '-d', '-t', '-g', `"${apkPath}"`] };
  }

  async installApp(apkPath: string): Promise<child_process.ChildProcess> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('installApp', { serial, apkPath }), async () => {
      const { command, args } = this.installAppArgsInternal(apkPath);
      const rv = await ChildProcess.spawnAndWait(command, args, { timeout: 60000 * 5 }, printable);
      return rv;
    });
  }

  /**
   * @note if install failed with INSTALL_FAILED_UPDATE_INCOMPATIBLE then uninstall with keep data and install again
   */
  async installAppForce(appPath: string): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('installAppForce', { serial, appPath }), async () => {
      const logger = printable ?? adbLogger;
      logger.info(`installing app: ${appPath}`);
      const stat = await fs.promises.stat(appPath).catch(() => null);
      if (!stat) {
        throw new Error(`app not found: ${appPath}`);
      } else {
        logger.info(`app size: ${stat.size}`);
      }
      const { error, stdout, stderr } = await this.installAppWithReturningStdoutStderr(appPath, 5 * 60 * 1000)
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
      await this.uninstallApp(menifest.package, true);
      await this.installApp(appPath);
    });
  }

  async installAppWithReturningStdoutStderr(apkPath: string, timeout: number): Promise<ChildProcess.ExecResult> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('installAppWithReturningStdoutStderr', { serial, apkPath }), async () => {
      const { command, args } = this.installAppArgsInternal(apkPath);
      const mergedCommand = `${command} ${args.join(' ')}`;
      printable.verbose?.('installAppWithReturningStdoutStderr start', { command: mergedCommand });
      const rv = await new Promise<ChildProcess.ExecResult>((resolve, reject) => {
        child_process.exec(
          mergedCommand,
          {
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

  async runApp(packageName: string, launchableActivityName: string): Promise<child_process.ChildProcess> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('runApp', { serial, packageName }), async () => {
      const rv = await ChildProcess.spawnAndWait(
        adbBinary(),
        ['-P', `${DOGU_ADB_SERVER_PORT}`, '-s', serial, 'shell', 'am', 'start', '-e', 'testkey', 'testvalue', '-n', `${packageName}/${launchableActivityName}`],
        {},
        printable,
      );
      return rv;
    });
  }

  /*
   * ref: predefined activities https://stackoverflow.com/a/39873312
   */
  async runActivity(activityName: string): Promise<child_process.ChildProcess> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('runActivity', { serial, activityName }), async () => {
      const rv = await ChildProcess.spawnAndWait(adbBinary(), ['-P', `${DOGU_ADB_SERVER_PORT}`, '-s', serial, 'shell', 'am', 'start', '-a', `${activityName}`], {}, printable);
      return rv;
    });
  }

  async getPidOf(appName: string): Promise<string> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getPidOf', { serial, appName }), async () => {
      const cmdret = await shellIgnoreError(serial, `pidof ${appName}`, { printable });
      const rv = cmdret.stdout.trim();
      return rv;
    });
  }

  async getPackageInfoFromUid(uid: number): Promise<PackageInfo> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getPackageInfoFromUid', { serial, uid }), async () => {
      const cmdret = await shellIgnoreError(serial, `ps -n | grep ${uid}`, { printable });
      const splited = parseRecord(cmdret.stdout);
      const rv = splited.length < 9 ? DefaultPackageInfo() : { pid: parseInt(splited[1]), uid: uid, name: splited[splited.length - 1] };
      return rv;
    });
  }

  async kill(pid: string): Promise<string> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('kill', { serial, pid }), async () => {
      const cmdret = await shellIgnoreError(serial, `kill ${pid}`, { printable });
      const rv = cmdret.stdout.trim();
      return rv;
    });
  }

  async killPackage(packageName: string): Promise<string> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('killPackage', { serial, packageName }), async () => {
      const cmdret = await shellIgnoreError(serial, `am force-stop ${packageName}`, { printable });
      const rv = cmdret.stdout.trim();
      return rv;
    });
  }

  async killOnPort(port: number): Promise<boolean> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('killOnPort', { serial, port }), async () => {
      const packageInfo = await this.getPackageOnPort(port);
      if (packageInfo.pid < 0) {
        adbLogger.verbose('adb.killOnPort end', { serial, port, rv: false });
        return false;
      }
      await this.killPackage(packageInfo.name);
      return true;
    });
  }

  async runAppProcess(localPath: string, destPath: string, main: string): Promise<child_process.ChildProcess> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('runAppProcess', { serial, localPath, destPath }), async () => {
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

  async disablePackage(packageName: string, userId: number): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('disablePackage', { serial, packageName }), async () => {
      try {
        await shell(serial, `pm disable-user ${userId} ${packageName}`);
      } catch (e) {
        await shell(serial, `pm disable-user ${packageName}`);
      }
    });
  }

  async disableGooglePlayProtect(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('disableGooglePlayProtect', { serial }), async () => {
      await shellIgnoreError(serial, `settings put global package_verifier_user_consent -1`, { printable });
    });
  }

  async allowNonMarketApps(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('allowNonMarketApps', { serial }), async () => {
      await shellIgnoreError(
        serial,
        `settings put global install_non_market_apps 1
  `,
        { printable },
      );
    });
  }

  async getProps(): Promise<AndroidPropInfo> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getProps', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'getprop', { printable });
      const rv = parseAndroidShellProp(cmdret.stdout);
      return rv;
    });
  }

  async getProp(key: string): Promise<string> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getProp', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, `getprop ${key}`, { printable });
      return cmdret.stdout;
    });
  }

  // Profile GPU Rendering (https://stackoverflow.com/questions/42492191/how-to-show-hide-profile-gpu-rendering-as-bars-using-adb-command)
  async setProfileGPURendering(value: string): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('setProfileGPURendering', { serial, value }), async () => {
      await this.setProp('debug.hwui.profile', value);
    });
  }

  async setProp(propName: string, propValue: string): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('setProp', { serial, propName, propValue }), async () => {
      await shell(serial, `setprop ${propName} ${propValue}`);
    });
  }

  async getProcCpuInfo(): Promise<AndroidProcCpuInfo[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getProcCpuInfo', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'cat /proc/cpuinfo', { printable });
      const rv = parseAndroidProcCpuInfo(cmdret.stdout);
      return rv;
    });
  }

  async getProcMemInfo(): Promise<AndroidProcMemInfo> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getProcMemInfo', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'cat /proc/meminfo', { printable });
      const rv = parseAndroidProcMemInfo(cmdret.stdout);
      return rv;
    });
  }

  async getProcDiskstats(): Promise<AndroidProcDiskstats[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getProcDiskstats', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'cat /proc/diskstats', { printable });
      const rv = parseAndroidProcDiskstats(cmdret.stdout);
      return rv;
    });
  }

  async getDfInfo(): Promise<AndroidDfInfo[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getDfInfo', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'df', { printable });
      const rv = parseAndroidShellDf(cmdret.stdout);
      return rv;
    });
  }

  async getShellTopInfo(): Promise<AndroidShellTopInfo> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getShellTopInfo', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'top -bn1', { printable });
      const rv = parseAndroidShellTop(cmdret.stdout);
      return rv;
    });
  }
  //#endregion

  //#region device info
  async getForegroundPackage(): Promise<FocusedAppInfo[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getForegroundPackage', { serial }), async () => {
      const cmdret = await shellIgnoreError(serial, 'dumpsys input | grep -A10 FocusedApplication', { printable });
      const lines = cmdret.stdout.split(os.EOL);
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

  async getIntalledPackages(flags = ''): Promise<InstalledPackage[]> {
    const { serial, printable } = this;
    const { stdout } = await shell(serial, `pm list packages -f ${flags}`);
    const installedPackages = stdout
      .split(os.EOL)
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
      .map(({ line, match }) => ({ line, match }) as { line: string; match: RegExpExecArray })
      .filter(({ line, match }) => {
        if (!match.groups) {
          adbLogger.warn(`Failed to match groups in package line: ${line}`);
        }
        return !!match.groups;
      })
      .map(({ line, match }) => ({ line, groups: match.groups }) as { line: string; groups: Record<string, string> })
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
          }) as InstalledPackage,
      );
    return installedPackages;
  }

  async getNonSystemIntalledPackages(): Promise<InstalledPackage[]> {
    const { serial, printable } = this;
    return this.getIntalledPackages('-3');
  }

  async getIMEList(): Promise<ImeInfo[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getIMEList', { serial }), async () => {
      const { stdout } = await shell(serial, `ime list -a`);
      const ret = parseIMEList(stdout);
      return ret;
    });
  }

  /*
   * ref: https://stackoverflow.com/a/33480790
   */
  async putIMESecure(ime: ImeInfo): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('putIMESecure', { serial, ime }), async () => {
      await shell(serial, `settings put secure enabled_input_methods ${ime.packageName}/${ime.service}`);
    });
  }

  async getInstalledPackageInfo(packageName: string, queryOptions: InstalledPackageQueryOptions): Promise<InstalledPackageInfo> {
    const { serial, printable } = this;
    const { stdout } = await shell(serial, `dumpsys package ${packageName}`);
    const lines = stdout.split(os.EOL);
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
  //#endregion

  //#region display
  async isScreenOn(): Promise<boolean> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('isScreenOn', { serial }), async () => {
      const result = await shellIgnoreError(serial, 'dumpsys input_method', { printable });
      const rv = result.stdout.includes('mInteractive=true');
      return rv;
    });
  }

  async isDreamingLockScreen(): Promise<boolean> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('isDreamingLockScreen', { serial }), async () => {
      const result = await shellIgnoreError(serial, 'dumpsys window | grep mDreamingLockscreen=true', { printable });
      const rv = result.stdout.includes('mDreamingLockscreen=true');
      return rv;
    });
  }

  async turnOnScreen(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('turnOnScreen', { serial }), async () => {
      const isTurnOff = !(await this.isScreenOn());
      if (isTurnOff) {
        await this.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_WAKEUP);
        if (await this.isDreamingLockScreen()) {
          await this.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU);
        }
      }
    });
  }

  async turnOffScreen(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('turnOffScreen', { serial }), async () => {
      const random = Math.random();
      adbLogger.verbose('adb.turnOffScreen begin', { serial, random });
      const isTurnOn = await this.isScreenOn();
      if (isTurnOn) {
        await this.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SLEEP);
      }
      adbLogger.verbose('adb.turnOffScreen end', { serial, random });
    });
  }

  async keepScreenOn(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('keepScreenOn', { serial }), async () => {
      await shellIgnoreError(serial, 'svc power stayon true', { printable });
    });
  }

  async keepScreenOff(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('keepScreenOff', { serial }), async () => {
      await shellIgnoreError(serial, 'svc power stayon false', { printable });
    });
  }

  async keyevent(keyEvent: DeviceControlKeycode): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('keyevent', { serial, keyEvent }), async () => {
      await shellIgnoreError(serial, `input keyevent ${keyEvent}`, { printable });
    });
  }

  async getCurrentDisplaySize(): Promise<{ physical: { width: number; height: number }; override: { width: number; height: number } }> {
    const { serial, printable } = this;
    return await retry(async () => {
      return await usingAsnyc(new AdbSerialScope('getCurrentDisplaySize', { serial }), async () => {
        const result = await shell(serial, 'wm size');
        // get adb shell wm output
        // Physical size: 1080x1920
        // Override size: 1080x1920
        const regex = /(\d+)x(\d+)/g;
        const ret = { physical: { width: 0, height: 0 }, override: { width: 0, height: 0 } };
        const matched = result.stdout.match(regex);
        if (matched === null) {
          return ret;
        }
        const matchInfo = matched[0];
        if (matchInfo === undefined) {
          return ret;
        }
        const [width, height] = matchInfo.split('x').map((v) => parseInt(v, 10));
        if (width === undefined) {
          return ret;
        }
        if (height === undefined) {
          return ret;
        }
        ret.physical.width = width;
        ret.physical.height = height;
        if (1 < matched.length) {
          const matchInfo = matched[1];
          if (matchInfo) {
            const [width, height] = matchInfo.split('x').map((v) => parseInt(v, 10));
            if (width === undefined) {
              return ret;
            }
            if (height === undefined) {
              return ret;
            }
            ret.override.width = width;
            ret.override.height = height;
          }
        }

        return ret;
      });
    });
  }

  async setDisplaySize(option: { width: number; height: number }): Promise<void> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('setDisplaySize', { serial, option }), async () => {
      await shell(serial, `wm size ${option.width}x${option.height}`);
    });
  }

  async resetDisplaySize(): Promise<void> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('resetDisplaySize', { serial }), async () => {
      await shell(serial, `wm size reset`);
    });
  }

  async getDeviceDisplays(): Promise<DisplayDeviceInfo[]> {
    const { serial } = this;
    return await retry(async () => {
      return await usingAsnyc(new AdbSerialScope('getDeviceDisplays', { serial }), async () => {
        const result = await shell(serial, 'dumpsys display | grep DisplayDeviceInfo');
        const ret: DisplayDeviceInfo[] = [];
        const lines = result.stdout.split(os.EOL);
        for (const line of lines) {
          const regex = /DisplayDeviceInfo{.+width=(?<width>\d+), height=(?<height>\d+)/g;
          const match = regex.exec(line);
          if (match && match.groups) {
            const width = parseInt(match.groups.width);
            const height = parseInt(match.groups.height);
            ret.push({ width, height });
            continue;
          }
        }
        return ret;
      });
    });
  }

  async stayOnWhilePluggedIn(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('stayOnWhilePluggedIn', { serial }), async () => {
      await shellIgnoreError(serial, 'settings put global stay_on_while_plugged_in 3', { printable });
    });
  }

  async setBrightness(value: number): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('setBrightness', { serial, value }), async () => {
      await shellIgnoreError(serial, `settings put system screen_brightness ${value}`, { printable });
    });
  }
  //#endregion

  //#region security
  async unlock(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('unlock', { serial }), async () => {
      await this.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU);
      await this.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ENTER);
    });
  }

  async reboot(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('reboot', { serial }), async () => {
      const random = Math.random();
      adbLogger.verbose('adb.reboot begin', { serial, random });
      await commandIgnoreError(serial, 'reboot', { printable });
      adbLogger.verbose('adb.reboot end', { serial, random });
    });
  }

  async reconnect(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('reconnect', { serial }), async () => {
      await commandIgnoreError(serial, 'reconnect', { printable });
      await commandIgnoreError(serial, 'usb', { printable });
    });
  }

  async getTime(): Promise<string | undefined> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getTime', { serial }), async () => {
      try {
        const result = await shellIgnoreError(serial, `echo $(date +'%Y-%m-%d %H:%M:%S')`, { printable });
        return `${result.stdout.trim()}.000`;
      } catch (e) {
        return undefined;
      }
    });
  }

  async getUptimeSeconds(): Promise<number | undefined> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getUptimeSeconds', { serial }), async () => {
      try {
        const result = await shellIgnoreError(serial, 'cat /proc/uptime', { printable });
        const uptime = result.stdout.split(' ')[0];
        const uptimeSeconds = parseFloat(uptime);
        return uptimeSeconds;
      } catch (e) {
        return undefined;
      }
    });
  }
  //#endregion

  //#region file system
  @Retry({ retryCount: 3, retryInterval: 300 })
  async readDir(path: string): Promise<AndroidFileEntry[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('readDir', { serial, path }), async () => {
      const result = await shell(serial, `ls -l "${path}"`);
      const rv = parseAndroidLs(result.stdout);
      return rv;
    });
  }

  @Retry({ retryCount: 3, retryInterval: 300 })
  async removeDir(path: string): Promise<AndroidFileEntry[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('removeDir', { serial, path }), async () => {
      const result = await shell(serial, `rm -rf "${path}"`);
      const rv = parseAndroidLs(result.stdout);
      return rv;
    });
  }

  @Retry({ retryCount: 3, retryInterval: 300 })
  async mkdir(path: string): Promise<AndroidFileEntry[]> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('removeDir', { serial, path }), async () => {
      const result = await shell(serial, `mkdir "${path}"`);
      const rv = parseAndroidLs(result.stdout);
      return rv;
    });
  }
  //#endregion

  //#region location

  async getFusedLocation(): Promise<GeoLocation> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getFusedLocation', { serial }), async () => {
      const result = await shell(serial, 'dumpsys location');
      const out = result.stdout;
      const lines = out.split(os.EOL);
      for (const line of lines) {
        // match this text "Location[fused 37.392554,126.939496 hAcc=1600"
        const regex = /Location\[fused (?<lat>[\d\.]+),(?<lon>[\d\.]+)/g;
        const match = regex.exec(out);
        if (match && match.groups) {
          const latitude = parseFloat(match.groups.lat);
          const longitude = parseFloat(match.groups.lon);
          return { latitude, longitude };
        }
      }
      throw new Error(`Failed to get location. ${out}`);
    });
  }

  async enableLocation(type: 'gps' | 'network'): Promise<void> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('enableLocation', { serial }), async () => {
      await shell(serial, `settings put secure location_providers_allowed +${type}`);
    });
  }

  async disableLocation(type: 'gps' | 'network'): Promise<void> {
    const { serial } = this;
    return await usingAsnyc(new AdbSerialScope('disableLocation', { serial }), async () => {
      await shell(serial, `settings put secure location_providers_allowed -${type}`);
    });
  }

  //#endregion

  //#region emulator
  async getEmulatorName(): Promise<string> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('getEmulatorName', { serial }), async () => {
      const result = await execIgnoreError(`${adbPrefix()} -s ${serial} emu avd name`, { printable });
      const lines = result.stdout.split(os.EOL);
      if (lines.length < 1) {
        throw new Error(`Failed to get emulator name. ${result.stderr}`);
      }
      const rv = lines[0].trim();
      return rv;
    });
  }
  //#endregion

  //#region reset
  NotDangerousPackagePrefixes = [
    'com.android.bluetooth',
    'com.android.calllogbackup',
    'com.android.captiveportallogin',
    'com.android.chrome',
    'com.android.cts.priv.ctsshim',
    'com.android.defcontainer',
    'com.android.dreams',
    'com.android.externalstorage',
    'com.android.htmlviewer',
    'com.android.inputdevices',
    'com.android.keychain',
    'com.android.location',
    'com.android.mms',
    'com.android.phone',
    'com.android.providers',
    'com.android.settings',
    'com.android.settings.intelligence',
    'com.android.server.telecom',
    'com.android.traceur',
    'com.android.vending',
    'com.google.android.apps.maps',
    'com.google.android.webview',
    'com.google.android.youtube',
  ];

  /**
   * @requires Android 10+
   * @note It takes about three minutes.
   * @link https://developer.android.com/tools/adb#test_harness
   */
  async enableTestharness(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('enableTestharness', { serial }), async (scope: AdbSerialScope) => {
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

  async resetPackages(): Promise<void> {
    const { serial, printable: logger } = this;
    return await usingAsnyc(new AdbSerialScope('resetPackages', { serial }), async (scope: AdbSerialScope) => {
      const allApps = await this.getIntalledPackages();
      const userApps = await this.getNonSystemIntalledPackages();
      if (allApps.length === 0 || userApps.length === 0) {
        throw new Error(`adb.resetPackages failed to get packages, allApps: ${allApps.length}, userApps: ${userApps.length}`);
      }

      const systemApps = allApps.filter((app) => !userApps.find((userApp) => userApp.packageName === app.packageName));

      const rmUsersPromises = userApps.map(async (app): Promise<void> => {
        await this.clearApp(app.packageName);
        await this.uninstallApp(app.packageName, false);
        return Promise.resolve();
      });
      const rmSystemsPromises = systemApps.map(async (app): Promise<void> => {
        const isNotDangerous = this.NotDangerousPackagePrefixes.find((prefix) => app.packageName.startsWith(prefix));
        if (!isNotDangerous) {
          return;
        }
        await this.clearApp(app.packageName);

        return Promise.resolve();
      });

      const allPromises = [...rmUsersPromises, ...rmSystemsPromises];
      await Promise.all(allPromises);
    });
  }

  async resetSdcard(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('resetSdcard', { serial }), async (scope: AdbSerialScope) => {
      const { random } = scope;
      const mkdirLists = ['Alarms', 'DCIM', 'Documents', 'Download', 'Movies', 'Music', 'Notifications', 'Pictures', 'Podcasts', 'Ringtones'];
      const files = await this.readDir('/storage/emulated/0');
      const promises = files.map(async (file): Promise<void> => {
        let dirPath = `/storage/emulated/0/${file.name}`;
        if (file.name === 'Android') {
          dirPath = `/storage/emulated/0/Android/data`;
        }
        await this.removeDir(dirPath).catch((err) => {
          printable.error(`adb.resetSdcard failed to remove directory`, { error: stringify(err), path: dirPath, serial, random });
        });
        if (mkdirLists.includes(file.name)) {
          await this.mkdir(dirPath).catch((err) => {
            printable.error(`adb.resetSdcard failed to make directory`, { error: stringify(err), path: dirPath, serial, random });
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
  @Retry({ retryCount: 3, retryInterval: 300 })
  async resetIME(): Promise<void> {
    const { serial, printable } = this;
    return await usingAsnyc(new AdbSerialScope('resetIME', { serial }), async () => {
      await shell(serial, `ime reset`);
    });
  }
  //#endregion

  async getSystemBarVisibility(): Promise<AndroidSystemBarVisibility> {
    const { serial, printable } = this;
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
    stdout.split(os.EOL).forEach((line, index, lines) => {
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
