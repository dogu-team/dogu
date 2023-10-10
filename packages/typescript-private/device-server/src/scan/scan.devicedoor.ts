import { ErrorDevice, PlatformSerial, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { errorify, loop, stringify, stringifyError } from '@dogu-tech/common';
import { DeviceChannel } from '../internal/public/device-channel';
import { DeviceDriver } from '../internal/public/device-driver';
import { logger } from '../logger/logger.instance';

interface DeviceDoorEvent {
  onOpening: (platformSerial: PlatformSerial) => Promise<void>;
  onError: (device: ErrorDevice) => Promise<void>;
  onOpen: (channel: DeviceChannel) => Promise<void>;
  onClose: (serial: Serial) => Promise<void>;
}

interface DeviceDoorState {
  type: 'none' | 'opening' | 'opened' | 'error' | 'closed';
  error: Error | null;
}

export class DeviceDoor {
  public channel: DeviceChannel | null = null;
  private _isClosedForALongTime = false;
  private _state: DeviceDoorState = { type: 'none', error: null };
  private _latestOpenTime = 0;
  private _firstCloseTime = 0;
  private _latestCloseTime = 0;
  private _closeReason = '';
  private _healthFaliCount = 0;

  constructor(public readonly driver: DeviceDriver, public serial: Serial, private readonly callback: DeviceDoorEvent) {
    this.process().catch((error) => {
      logger.error(`DeviceDoor.process. serial: ${serial}, platform:${driver.platform} is error`, { error: stringify(error) });
    });
  }

  openIfNotActive(): void {
    this._firstCloseTime = 0;
    this._latestCloseTime = 0;
    this._latestOpenTime = Date.now();
  }

  close(reason: string): void {
    this._latestOpenTime = 0;
    if (0 == this._firstCloseTime) {
      this._firstCloseTime = Date.now();
    }
    this._closeReason = reason;
    this._latestCloseTime = Date.now();
  }

  isClosedForALongTime(): boolean {
    return this._isClosedForALongTime;
  }

  state(): DeviceDoorState {
    return this._state;
  }

  private async process(): Promise<void> {
    for await (const _ of loop(1000)) {
      await this.processInternal();
      if (this._isClosedForALongTime) {
        return;
      }
    }
  }

  private async processInternal(): Promise<void> {
    if (null == this.channel && this._latestCloseTime < this._latestOpenTime) {
      try {
        this._state = { type: 'opening', error: null };
        logger.info(`DeviceDoor.processInternal initChannel serial:${this.serial}`);
        await this.callback.onOpening({ platform: platformTypeFromPlatform(this.driver.platform), serial: this.serial });
        this.channel = await this.driver.openChannel({
          serial: this.serial,
        });
        this._state = { type: 'opened', error: null };
        await this.callback.onOpen(this.channel);
      } catch (e) {
        const error = errorify(e);
        logger.error(`DeviceDoor.processInternal initChannel error serial:${this.serial} ${stringifyError(error)}`);
        this.channel = null;
        this._firstCloseTime = Date.now();
        this._latestCloseTime = Date.now();
        this._state = { type: 'error', error };
        await this.callback.onError({
          platform: platformTypeFromPlatform(this.driver.platform),
          serial: this.serial,
          error,
        });
      }
      return;
    }
    let closeForced = false;
    if (this.channel && this._state.type === 'opened') {
      const healthStatus = await this.channel.checkHealth();
      if (!healthStatus.isHealthy) {
        this._healthFaliCount++;
        if (this._healthFaliCount > 3) {
          this._closeReason = 'health check failed';
          closeForced = true;
        }
      } else {
        this._healthFaliCount = 0;
      }
    }

    if ((this._latestOpenTime < this._latestCloseTime && 10000 < this._latestCloseTime - this._firstCloseTime) || closeForced) {
      this.channel = null;
      logger.info(
        `DeviceDoor.processInternal closeChannel serial:${this.serial}, firstCloseTime: ${this._firstCloseTime}, latestCloseTime: ${this._latestCloseTime}, reason: ${
          this._closeReason
        }, forced: ${stringify(closeForced)}`,
      );
      await Promise.resolve(this.driver.closeChannel(this.serial)).catch((error) => {
        logger.error(`DeviceDoor.processInternal closeChannel error serial:${this.serial} ${stringifyError(error)}`);
      });
      await this.callback.onClose(this.serial).catch((error) => {
        logger.error(`DeviceDoor.processInternal onClose error serial:${this.serial} ${stringifyError(error)}`);
      });
      this._isClosedForALongTime = true;
      this._state = { type: 'closed', error: null };
      return;
    }
  }
}

export class DeviceDoors {
  private _doors: DeviceDoor[] = [];

  constructor(private readonly callback: DeviceDoorEvent) {}

  openIfNotActive(driver: DeviceDriver, serial: Serial): void {
    this.cleanupClosedDoor();

    const platform = driver.platform;
    const door = this._doors.find((door) => door.driver.platform === platform && door.serial === serial);
    if (!door) {
      const newDoor = new DeviceDoor(driver, serial, this.callback);
      this._doors.push(newDoor);
      newDoor.openIfNotActive();
      return;
    }
    door.openIfNotActive();
  }

  closeDoor(driver: DeviceDriver, serial: Serial, reason: string): void {
    this.cleanupClosedDoor();

    const platform = driver.platform;
    const door = this._doors.find((door) => door.driver.platform === platform && door.serial === serial);
    if (!door) {
      logger.warn(`DeviceDoors.closeDoor. serial: ${serial}, platform:${platform} is not found`);
      return;
    }
    door.close(reason);
  }

  get channels(): DeviceChannel[] {
    return this._doors.filter((door) => null !== door.channel && 'opened' === door.state().type).map((door) => door.channel!);
  }

  get channelsOpening(): PlatformSerial[] {
    return this._doors
      .filter((door) => 'opening' === door.state().type)
      .map((door) => {
        return {
          platform: platformTypeFromPlatform(door.driver.platform),
          serial: door.serial,
        };
      });
  }

  get channelsWithError(): ErrorDevice[] {
    return this._doors
      .filter((door) => 'error' === door.state().type)
      .map((door) => {
        return {
          platform: platformTypeFromPlatform(door.driver.platform),
          serial: door.serial,
          error: door.state().error ?? new Error('Unknown error'),
        };
      });
  }

  private cleanupClosedDoor(): void {
    this._doors = this._doors.filter((door) => !door.isClosedForALongTime());
  }
}
