import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import systeminformation from 'systeminformation';
import { SeleniumDeviceWebDriverHandlerService } from '../../device-webdriver-handler/selenium-device-webdriver-handler.service';
import { GamiumService } from '../../gamium/gamium.service';
import { logger } from '../../logger/logger.instance';
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
    private readonly seleniumWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService,
  ) {}

  static async create(deviceServerPort: number, gamiumService: GamiumService, seleniumWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService): Promise<WindowsDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_WINDOWS, deviceServerPort);
    return new WindowsDriver(streaming, gamiumService, seleniumWebDriverHandlerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_WINDOWS;
  }

  async scanSerials(): Promise<Serial[]> {
    const uuid = await systeminformation.uuid();
    return [uuid.os];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await WindowsChannel.create(initParam, this.streamingService, this.gamiumService, this.seleniumWebDriverHandlerService);
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
