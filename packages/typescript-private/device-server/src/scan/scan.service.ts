import { DeviceConnectionState, Platform, PlatformSerial, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { DuplicatedCallGuarder, Instance, stringifyError, validateAndEmitEventAsync } from '@dogu-tech/common';
import { DeviceConnectionSubscribe } from '@dogu-tech/device-client-common';
import { processPlatform } from '@dogu-tech/node';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { AppiumService } from '../appium/appium.service';
import { AppiumDeviceWebDriverHandlerService } from '../device-webdriver-handler/appium-device-webdriver-handler.service';
import { SeleniumDeviceWebDriverHandlerService } from '../device-webdriver-handler/selenium-device-webdriver-handler.service';
import { env } from '../env';
import { OnDeviceConnectionSubscriberConnectedEvent, OnDevicesConnectedEvent, OnDevicesDisconnectedEvent, OnUpdateEvent } from '../events';
import { GamiumService } from '../gamium/gamium.service';
import { DeviceChannel } from '../internal/public/device-channel';
import { DeviceDriver } from '../internal/public/device-driver';
import { createDeviceDriverFactoryByHostPlatform } from '../internal/public/device-driver-factory';
import { DoguLogger } from '../logger/logger';
import { DeviceDoors } from './scan.devicedoor';

@Injectable()
export class ScanService implements OnModuleInit {
  private driverMap: Map<Platform, DeviceDriver> = new Map();
  private deviceDoors: DeviceDoors;
  private befTime = Date.now();
  private onUpdateGuarder = new DuplicatedCallGuarder();
  private maxRemoveMarkCount = 3;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: DoguLogger,
    private readonly appiumService: AppiumService,
    private readonly gamiumService: GamiumService,
    private readonly appiumDeviceWebDriverHandlerService: AppiumDeviceWebDriverHandlerService,
    private readonly seleniumDeviceWebDriverHandlerService: SeleniumDeviceWebDriverHandlerService,
  ) {
    this.deviceDoors = new DeviceDoors({
      onOpen: async (channel: DeviceChannel): Promise<void> => {
        await validateAndEmitEventAsync(this.eventEmitter, OnDevicesConnectedEvent, { channels: [channel] });
      },
      onClose: async (serial: Serial): Promise<void> => {
        await validateAndEmitEventAsync(this.eventEmitter, OnDevicesDisconnectedEvent, { serials: [serial] });
      },
    });
  }

  get channels(): DeviceChannel[] {
    return this.deviceDoors.channels;
  }

  async onModuleInit(): Promise<void> {
    const hostPlatform = processPlatform();
    const factory = createDeviceDriverFactoryByHostPlatform(
      hostPlatform,
      env.DOGU_DEVICE_SERVER_PORT,
      this.appiumService,
      this.gamiumService,
      this.appiumDeviceWebDriverHandlerService,
      this.seleniumDeviceWebDriverHandlerService,
    );
    this.driverMap = await factory.create();
  }

  @OnEvent(OnDeviceConnectionSubscriberConnectedEvent.key)
  onDeviceConnectionSubscriberConnected(value: Instance<typeof OnDeviceConnectionSubscriberConnectedEvent.value>): void {
    const { webSocket } = value;
    const messages = this.channels.map((channel) => {
      const { serial, platform, info } = channel;
      const { system, version, graphics } = info;
      const { model, manufacturer } = system;
      const display = graphics.displays.at(0);
      const resolutionWidth = display?.resolutionX ?? 0;
      const resolutionHeight = display?.resolutionY ?? 0;
      const message: Instance<typeof DeviceConnectionSubscribe.receiveMessage> = {
        serial,
        platform,
        model,
        version,
        state: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED,
        manufacturer,
        resolutionWidth,
        resolutionHeight,
      };
      return message;
    });
    messages.forEach((message) => {
      webSocket.send(JSON.stringify(message));
    });
  }

  @OnEvent(OnUpdateEvent.key)
  async onUpdate(value: Instance<typeof OnUpdateEvent.value>): Promise<void> {
    await this.onUpdateGuarder.guard(async () => {
      try {
        await this.scan();
      } catch (error) {
        this.logger.error(`ScanService.update error: ${stringifyError(error)}`);
      }
    });
  }

  private async scan(): Promise<void> {
    // log for every 3 seconds
    if (Date.now() - this.befTime > 3000) {
      this.befTime = Date.now();
      this.logger.info('ScanService.update', { count: this.channels.length, serials: this.channels.map((c) => c.serial) });
    }

    for (const [platform, driver] of this.driverMap) {
      const befChannels = this.getChannelsByPlatform(platform);
      const befSerials = befChannels.map((channel) => channel.serial);

      const scannedSerials = await Promise.resolve(driver.scanSerials()).catch((e) => {
        this.logger.error(`ScanService.update scanSerials platform: ${platform}, error: ${stringifyError(e)}`);
        return [] as string[];
      });

      const removedSerials = befSerials.filter((currentSerial) => !scannedSerials.find((newSerial) => currentSerial == newSerial));
      if (removedSerials.length !== 0) {
        this.logger.info('ScanService.update removed', {
          platform,
          removedSerials,
        });
      }
      scannedSerials.forEach((serial) => {
        this.deviceDoors.openDoorIfNotActive(driver, serial);
      });

      removedSerials.forEach((serial) => {
        this.deviceDoors.closeDoor(driver, serial);
      });
    }
  }

  serials(): Serial[] {
    return this.channels.map((channel) => channel.serial);
  }

  platformSerials(): PlatformSerial[] {
    return this.channels.map((channel) => {
      return {
        platform: platformTypeFromPlatform(channel.platform),
        serial: channel.serial,
      };
    });
  }

  findChannel(serial: Serial): Readonly<DeviceChannel> | null {
    for (const channel of this.channels) {
      if (channel.serial == serial) return channel;
    }
    return null;
  }

  getChannels(): Readonly<DeviceChannel[]> {
    return this.channels;
  }

  getChannelsByPlatform(platform: Platform): Readonly<DeviceChannel[]> {
    return this.channels.filter((channel) => channel.platform === platform).map((channel) => channel);
  }

  getDriver(platform: Platform): Readonly<DeviceDriver> | undefined {
    return this.driverMap.get(platform);
  }
}
