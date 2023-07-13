import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import systeminformation from 'systeminformation';
import { DeviceWebDriver } from '../../alias';
import { GamiumService } from '../../gamium/gamium.service';
import { HttpRequestRelayService } from '../../http-request-relay/http-request-relay.common';
import { DoguLogger } from '../../logger/logger';
import { logger } from '../../logger/logger.instance';
import { SeleniumService } from '../../selenium/selenium.service';
import { WindowsChannel } from '../channel/windows-channel';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class WindowsDriver implements DeviceDriver {
  private channelMap = new Map<Serial, WindowsChannel>();

  private constructor(
    private readonly streamingService: StreamingService,
    private readonly gamiumService: GamiumService,
    private readonly httpRequestRelayService: HttpRequestRelayService,
    private readonly seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
    private readonly seleniumService: SeleniumService,
    private readonly doguLogger: DoguLogger,
  ) {}

  static async create(
    deviceServerPort: number,
    gamiumService: GamiumService,
    httpRequestRelayService: HttpRequestRelayService,
    seleniumEndpointHandlerService: DeviceWebDriver.SeleniumEndpointHandlerService,
    seleniumService: SeleniumService,
    doguLogger: DoguLogger,
  ): Promise<WindowsDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_WINDOWS, deviceServerPort);
    return new WindowsDriver(streaming, gamiumService, httpRequestRelayService, seleniumEndpointHandlerService, seleniumService, doguLogger);
  }

  get platform(): Platform {
    return Platform.PLATFORM_WINDOWS;
  }

  async scanSerials(): Promise<Serial[]> {
    const uuid = await systeminformation.uuid();
    return [uuid.os];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await WindowsChannel.create(
      initParam,
      this.streamingService,
      this.gamiumService,
      this.httpRequestRelayService,
      this.seleniumEndpointHandlerService,
      this.seleniumService,
      this.doguLogger,
    );
  }

  async closeChannel(seial: Serial): Promise<void> {
    const channel = this.channelMap.get(seial);
    if (channel) {
      await channel.close().catch((error) => {
        logger.error('Failed to close channel', { error: errorify(error) });
      });
      this.channelMap.delete(seial);
    }
    await this.streamingService.deviceDisconnected(seial);
  }

  async reset(): Promise<void> {
    logger.warn('WindowsDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
