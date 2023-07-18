import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import { DeviceWebDriver } from '../../alias';
import { AppiumService } from '../../appium/appium.service';
import { env } from '../../env';
import { GamiumService } from '../../gamium/gamium.service';
import { HttpRequestRelayService } from '../../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../../logger/logger';
import { logger } from '../../logger/logger.instance';
import { IosChannel } from '../channel/ios-channel';
import { SystemProfiler, XcodeBuild, Xctrace } from '../externals';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver, DeviceScanInfo } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';

export class IosDriver implements DeviceDriver {
  private channelMap = new Map<Serial, IosChannel>();

  private constructor(
    private readonly streaming: PionStreamingService,
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
  ): Promise<IosDriver> {
    await IosDriver.clearIdaClones();
    await XcodeBuild.validateXcodeBuild();

    const streaming = await PionStreamingService.create(Platform.PLATFORM_IOS, env.DOGU_DEVICE_SERVER_PORT);
    return new IosDriver(streaming, appiumService, gamiumService, httpRequestRelayService, appiumEndpointHandlerService, doguLogger);
  }

  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }

  async scanSerials(): Promise<DeviceScanInfo[]> {
    const deviceInfosFromXctrace = await Xctrace.listDevices(logger);
    const serialsSystemProfiler = await SystemProfiler.usbDataTypeToSerials();
    const deviceInfos = deviceInfosFromXctrace.map((deviceInfo) => {
      if (serialsSystemProfiler.includes(deviceInfo.serial)) {
        deviceInfo.status = 'online';
      } else {
        deviceInfo.status = 'usb-disconnected';
      }
      return deviceInfo;
    });
    return deviceInfos;
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const channel = await IosChannel.create(
      initParam,
      this.streaming,
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
    return await this.streaming.deviceDisconnected(serial);
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }

  static async clearIdaClones(): Promise<void> {
    const idaRunspacesPath = HostPaths.external.xcodeProject.idaDerivedDataClonePath();
    if (fs.existsSync(idaRunspacesPath)) {
      await fs.promises.rm(idaRunspacesPath, { recursive: true });
    }
    await fs.promises.mkdir(idaRunspacesPath, { recursive: true });
  }
}
