import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import systeminformation from 'systeminformation';
import { env } from '../../env';
import { logger } from '../../logger/logger.instance';
import { WindowsChannel } from '../channel/windows-channel';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class WindowsDriver implements DeviceDriver {
  private channelMap = new Map<Serial, WindowsChannel>();

  private constructor(private readonly streamingService: StreamingService, private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<WindowsDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_WINDOWS, env.DOGU_DEVICE_SERVER_PORT);
    return new WindowsDriver(streaming, deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_WINDOWS;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const hostname = (await systeminformation.osInfo()).hostname;
    const uuid = await systeminformation.uuid();
    return [{ serial: uuid.os, status: 'online', name: hostname }];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await WindowsChannel.create(initParam, this.streamingService, this.deviceServerService);
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
