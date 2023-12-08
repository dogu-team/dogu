import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { checkFileEqual, HostPaths, killProcessOnPort } from '@dogu-tech/node';
import fs from 'fs';
import { logger } from '../../logger/logger.instance';
import { AndroidChannel } from '../channel/android-channel';
import { Adb, AppiumAdb, createAppiumAdb } from '../externals';
import { AdbSerial, DOGU_ADB_SERVER_PORT } from '../externals/cli/adb/adb';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';

const SerialToModelCache = new Map<Serial, string>();
export class AndroidDriver implements DeviceDriver {
  private channelMap = new Map<Serial, AndroidChannel>();

  private constructor(
    private readonly deviceServerService: DeviceServerService,
    private readonly appiumAdb: AppiumAdb,
  ) {}

  static async create(deviceServerService: DeviceServerService): Promise<AndroidDriver> {
    await AndroidDriver.replaceAppiumSettings();

    const appiumAdb = await createAppiumAdb();
    const driver = new AndroidDriver(deviceServerService, appiumAdb);
    await driver.reset();
    return driver;
  }

  get platform(): Platform {
    return Platform.PLATFORM_ANDROID;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const scanResults = await Adb.serials();
    const ret: DeviceScanResult[] = [];
    for (const r of scanResults) {
      if (r.status === 'online') {
        const model = await AndroidDriver.cacheAndGetModel(r.serial);
        ret.push({
          serial: r.serial,
          model: model,
          status: 'online',
        });
        continue;
      }
      ret.push({
        ...r,
        model: '',
      });
    }

    return ret;
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const cloneAppiumAdb = this.appiumAdb.clone({ adbExecTimeout: 1000 * 60 });
    cloneAppiumAdb.setDeviceId(initParam.serial);

    const channel = await AndroidChannel.create(initParam, this.deviceServerService, cloneAppiumAdb);
    this.channelMap.set(initParam.serial, channel);
    return channel;
  }

  async closeChannel(serial: Serial): Promise<void> {
    const channel = this.channelMap.get(serial);
    if (channel) {
      await channel.close().catch((error) => {
        logger.error('Failed to close channel', { error: errorify(error) });
      });
      this.channelMap.delete(serial);
    }
  }

  async reset(): Promise<void> {
    await killProcessOnPort(DOGU_ADB_SERVER_PORT, logger).catch((error) => {
      logger.warn('Failed to kill process on port', { error: errorify(error) });
    });
    await Adb.killServer();
    await Adb.startServer();
    return await Promise.resolve();
  }

  private static async replaceAppiumSettings(): Promise<void> {
    const originSettingsApkPath = HostPaths.thirdParty.pathMap().common.androidAppiumSettingsApk;
    const destSettingsApkPath = HostPaths.external.appium.settingsApk();
    const { isEqual, reason } = await checkFileEqual(originSettingsApkPath, destSettingsApkPath);
    if (isEqual) {
      logger.info('Appium settings apk is already replaced');
      return;
    }
    logger.info('Replace appium settings apk', { reason });
    await fs.promises.rm(destSettingsApkPath, { force: true });
    await fs.promises.copyFile(originSettingsApkPath, destSettingsApkPath);
  }

  private static async cacheAndGetModel(serial: Serial): Promise<string> {
    const cached = SerialToModelCache.get(serial);
    if (cached) {
      return cached;
    }

    const adb = new AdbSerial(serial, logger);
    const model = await adb.getProp('ro.product.model').catch(() => '');
    if (0 === model.length) {
      return '';
    }
    SerialToModelCache.set(serial, model);
    return model;
  }
}
