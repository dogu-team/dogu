import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { AppiumService } from '../../appium/appium.service';
import { GamiumService } from '../../gamium/gamium.service';
import { logger } from '../../logger/logger.instance';
import { IosChannel } from '../channel/ios-channel';
import { XcodeBuild } from '../externals';
import { MobileDevice } from '../externals/cli/mobiledevice';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';

export class IosDriver implements DeviceDriver {
  private channelMap = new Map<Serial, IosChannel>();

  private constructor(private readonly streaming: PionStreamingService, private readonly appiumService: AppiumService, private readonly gamiumService: GamiumService) {}

  static async create(deviceServerPort: number, appiumService: AppiumService, gamiumService: GamiumService): Promise<IosDriver> {
    // await IosDeviceAgent.clearRunspace();
    await XcodeBuild.validateXcodeBuild();

    const streaming = await PionStreamingService.create(Platform.PLATFORM_IOS, deviceServerPort);
    return new IosDriver(streaming, appiumService, gamiumService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }

  async scanSerials(): Promise<Serial[]> {
    const serialsFromMobileDevice = await MobileDevice.listDevices();
    const serials = new Set([...serialsFromMobileDevice]);
    return Array.from(serials.values());
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const channel = await IosChannel.create(initParam, this.streaming, this.appiumService, this.gamiumService);
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
}
