import { Platform, Serial } from '@dogu-private/types';
import systeminformation from 'systeminformation';
import { env } from '../../env';
import { createGdcLogger, idcLogger } from '../../logger/logger.instance';
import { LinuxChannel } from '../channel/linux-channel';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';
import { StreamingService } from '../services/streaming/streaming-service';

export class LinuxDriver implements DeviceDriver {
  private constructor(private readonly streamingService: StreamingService, private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<LinuxDriver> {
    const streaming = await PionStreamingService.create(Platform.PLATFORM_LINUX, env.DOGU_DEVICE_SERVER_PORT, createGdcLogger(Platform.PLATFORM_LINUX));
    return new LinuxDriver(streaming, deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_LINUX;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const hostname = (await systeminformation.osInfo()).hostname;
    const uuid = await systeminformation.uuid();
    return [{ serial: uuid.os, status: 'online', name: hostname }];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await LinuxChannel.create(initParam, this.streamingService, this.deviceServerService);
  }

  async closeChannel(seial: Serial): Promise<void> {
    return await this.streamingService.deviceDisconnected(seial);
  }

  async reset(): Promise<void> {
    idcLogger.warn('LinuxDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
