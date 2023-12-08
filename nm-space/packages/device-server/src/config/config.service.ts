import { Platform, Serial } from '@dogu-private/types';
import { Instance, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DefaultDeviceConfig, DeviceConfigDto } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OnDeviceConfigChangedEvent, OnDevicesConnectedEvent } from '../events';
import { ScanService } from '../scan/scan.service';

@Injectable()
export class ConfigService {
  private readonly configsFromRemote: Map<Serial, DeviceConfigDto> = new Map();

  constructor(
    private readonly scanService: ScanService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(OnDevicesConnectedEvent.key)
  async onDevicesConnected(value: Instance<typeof OnDevicesConnectedEvent.value>): Promise<void> {
    for (const channel of value.channels) {
      if (!this.configsFromRemote.has(channel.serial)) {
        const newConfig = DefaultDeviceConfig(channel.platform);
        this.configsFromRemote.set(channel.serial, newConfig);
        await validateAndEmitEventAsync(this.eventEmitter, OnDeviceConfigChangedEvent, { channel: channel, config: newConfig });
      }
    }
  }

  findConfig(serial: Serial, platform: Platform): Readonly<DeviceConfigDto> | undefined {
    const config = this.configsFromRemote.get(serial);
    if (!config) return DefaultDeviceConfig(platform);
    return config;
  }

  async applyConfig(serial: Serial, config: DeviceConfigDto): Promise<void> {
    this.configsFromRemote.set(serial, config);
    const channel = this.scanService.findChannel(serial);
    if (!channel) return;

    await validateAndEmitEventAsync(this.eventEmitter, OnDeviceConfigChangedEvent, { channel: channel, config: config });
  }
}
