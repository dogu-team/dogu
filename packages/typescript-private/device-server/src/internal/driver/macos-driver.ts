import { Platform, Serial } from '@dogu-private/types';
import systeminformation from 'systeminformation';
import { env } from '../../env';
import { idcLogger } from '../../logger/logger.instance';
import { MacosChannel } from '../channel/macos-channel';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class MacosDriver implements DeviceDriver {
  private constructor(private readonly streamingService: StreamingService, private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<MacosDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_MACOS, env.DOGU_DEVICE_SERVER_PORT);
    return new MacosDriver(streaming, deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_MACOS;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const hostname = (await systeminformation.osInfo()).hostname;
    const uuid = await systeminformation.uuid();
    return [{ serial: uuid.os, status: 'online', name: hostname }];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await MacosChannel.create(initParam, this.streamingService, this.deviceServerService);
  }

  async closeChannel(seial: Serial): Promise<void> {
    return await this.streamingService.deviceDisconnected(seial);
  }

  async reset(): Promise<void> {
    idcLogger.warn('MacosDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
