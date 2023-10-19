import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { killProcessOnPort } from '@dogu-tech/node';
import { env } from '../../env';
import { createGdcLogger, logger } from '../../logger/logger.instance';
import { AndroidChannel } from '../channel/android-channel';
import { Adb, AppiumAdb, createAppiumAdb } from '../externals';
import { DOGU_ADB_SERVER_PORT } from '../externals/cli/adb/adb';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class AndroidDriver implements DeviceDriver {
  private channelMap = new Map<Serial, AndroidChannel>();

  private constructor(private readonly streamingService: StreamingService, private readonly deviceServerService: DeviceServerService, private readonly appiumAdb: AppiumAdb) {}

  static async create(deviceServerService: DeviceServerService): Promise<AndroidDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_ANDROID, env.DOGU_DEVICE_SERVER_PORT, createGdcLogger(Platform.PLATFORM_ANDROID));
    const appiumAdb = await createAppiumAdb();
    const driver = new AndroidDriver(streaming, deviceServerService, appiumAdb);
    await driver.reset();
    return driver;
  }

  get platform(): Platform {
    return Platform.PLATFORM_ANDROID;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const serials = await Adb.serials();
    return serials;
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const cloneAppiumAdb = this.appiumAdb.clone({ adbExecTimeout: 1000 * 60 });
    cloneAppiumAdb.setDeviceId(initParam.serial);
    const channel = await AndroidChannel.create(initParam, this.streamingService, this.deviceServerService, cloneAppiumAdb);
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
    return await this.streamingService.deviceDisconnected(serial);
  }

  async reset(): Promise<void> {
    await killProcessOnPort(DOGU_ADB_SERVER_PORT, logger).catch((error) => {
      logger.warn('Failed to kill process on port', { error: errorify(error) });
    });
    await Adb.killServer();
    await Adb.startServer();
    return await Promise.resolve();
  }
}
