import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { DeviceWebDriver } from '../../alias';
import { AppiumService } from '../../appium/appium.service';
import { env } from '../../env';
import { GamiumService } from '../../gamium/gamium.service';
import { HttpRequestRelayService } from '../../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../../logger/logger';
import { logger } from '../../logger/logger.instance';
import { AndroidChannel } from '../channel/android-channel';
import { Adb } from '../externals';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class AndroidDriver implements DeviceDriver {
  private channelMap = new Map<Serial, AndroidChannel>();

  private constructor(
    private readonly streamingService: StreamingService,
    private readonly appiumService: AppiumService,
    private readonly gamiumService: GamiumService,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly appiumEndpointHandlerService: DeviceWebDriver.AppiumEndpointHandlerService,
    private readonly doguLogger: DoguLogger,
  ) {}

  static async create(
    appiumService: AppiumService,
    gamiumService: GamiumService,
    httpRequestRelayService: HttpRequestRelayService,
    appiumEndpointHandlerService: DeviceWebDriver.AppiumEndpointHandlerService,
    doguLogger: DoguLogger,
  ): Promise<AndroidDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_ANDROID, env.DOGU_DEVICE_SERVER_PORT);
    return new AndroidDriver(streaming, appiumService, gamiumService, httpRequestRelayService, appiumEndpointHandlerService, doguLogger);
  }

  get platform(): Platform {
    return Platform.PLATFORM_ANDROID;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const serials = await Adb.serials();
    return serials;
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const channel = await AndroidChannel.create(
      initParam,
      this.streamingService,
      this.appiumService,
      this.gamiumService,
      this.httpRequestRelayService,
      this.appiumEndpointHandlerService,
      this.doguLogger,
    );
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
    // await Adb.killServer();
    // await Adb.startServer();
    return await Promise.resolve();
  }
}
