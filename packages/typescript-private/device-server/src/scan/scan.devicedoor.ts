import { DeviceAgentPort, DeviceAgentSecondPort, DeviceAgentThirdPort, ErrorDevice, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { loop, stringify, stringifyError } from '@dogu-tech/common';
import { DeviceChannel } from '../internal/public/device-channel';
import { DeviceDriver } from '../internal/public/device-driver';
import { logger } from '../logger/logger.instance';

interface DeviceDoorEvent {
  onOpen: (channel: DeviceChannel) => Promise<void>;
  onClose: (serial: Serial) => Promise<void>;
}

export class DeviceDoor {
  public channel: DeviceChannel | null = null;
  private _isLongClosed = false;
  private _openError: Error | null = null;
  private _latestOpenTime = 0;
  private _firstCloseTime = 0;
  private _latestCloseTime = 0;

  constructor(public readonly driver: DeviceDriver, public readonly serial: Serial, private readonly callback: DeviceDoorEvent) {
    this.process().catch((error) => {
      logger.error(`DeviceDoor.process. serial: ${serial}, platform:${driver.platform} is error`, { error: stringify(error) });
    });
  }

  openDoorIfNotActive(): void {
    this._firstCloseTime = 0;
    this._latestCloseTime = 0;
    this._latestOpenTime = Date.now();
  }

  close(): void {
    this._latestOpenTime = 0;
    if (0 == this._firstCloseTime) {
      this._firstCloseTime = Date.now();
    }
    this._latestCloseTime = Date.now();
  }

  isLongClosed(): boolean {
    return this._isLongClosed;
  }

  openError(): Error | null {
    return this._openError;
  }

  private async process(): Promise<void> {
    for await (const _ of loop(1000)) {
      await this.processInternal();
      if (this._isLongClosed) {
        return;
      }
    }
  }

  private async processInternal(): Promise<void> {
    if (null == this.channel && this._latestCloseTime < this._latestOpenTime) {
      try {
        this.channel = await this.driver.openChannel({
          serial: this.serial,
          deviceAgentDevicePort: DeviceAgentPort,
          deviceAgentDeviceSecondPort: DeviceAgentSecondPort,
          deviceAgentDeviceThirdPort: DeviceAgentThirdPort,
        });
        await this.callback.onOpen(this.channel);
      } catch (error) {
        logger.error(`DeviceDoor.processInternal initChannel error serial:${this.serial} ${stringifyError(error)}`);
        this.channel = null;
        this._firstCloseTime = Date.now();
        this._latestCloseTime = Date.now();
        if (error instanceof Error) {
          this._openError = error;
        } else {
          this._openError = new Error(stringify(error));
        }
      }
      return;
    }

    if (this._latestOpenTime < this._latestCloseTime && 10000 < this._latestCloseTime - this._firstCloseTime) {
      this.channel = null;
      await this.driver.closeChannel(this.serial);
      await this.callback.onClose(this.serial);
      this._isLongClosed = true;
      return;
    }
  }
}

export class DeviceDoors {
  private _doors: DeviceDoor[] = [];

  constructor(private readonly callback: DeviceDoorEvent) {}

  openDoorIfNotActive(driver: DeviceDriver, serial: Serial): void {
    this.cleanupClosedDoor();

    const platform = driver.platform;
    const door = this._doors.find((door) => door.driver.platform === platform && door.serial === serial);
    if (!door) {
      const newDoor = new DeviceDoor(driver, serial, this.callback);
      this._doors.push(newDoor);
      newDoor.openDoorIfNotActive();
      return;
    }
    door.openDoorIfNotActive();
  }

  closeDoor(driver: DeviceDriver, serial: Serial): void {
    this.cleanupClosedDoor();

    const platform = driver.platform;
    const door = this._doors.find((door) => door.driver.platform === platform && door.serial === serial);
    if (!door) {
      logger.warn(`DeviceDoors.closeDoor. serial: ${serial}, platform:${platform} is not found`);
      return;
    }
    door.close();
  }

  get channels(): DeviceChannel[] {
    return this._doors.map((door) => door.channel).filter((channel) => null != channel) as DeviceChannel[];
  }

  get channelsWithOpenError(): ErrorDevice[] {
    return this._doors
      .filter((door) => null != door.openError())
      .map((door) => {
        return {
          platform: platformTypeFromPlatform(door.driver.platform),
          serial: door.serial,
          error: door.openError() as Error,
        };
      });
  }

  private cleanupClosedDoor(): void {
    this._doors = this._doors.filter((door) => !door.isLongClosed());
  }
}
