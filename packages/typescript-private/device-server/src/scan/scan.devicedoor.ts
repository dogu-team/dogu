import { DeviceAgentPort, DeviceAgentSecondPort, DeviceAgentThirdPort, ErrorDevice, platformTypeFromPlatform, Serial } from '@dogu-private/types';
import { loop, stringify, stringifyError } from '@dogu-tech/common';
import { DeviceChannel } from '../internal/public/device-channel';
import { DeviceDriver, DeviceScanInfo } from '../internal/public/device-driver';
import { logger } from '../logger/logger.instance';

interface DeviceDoorEvent {
  onOpen: (channel: DeviceChannel) => Promise<void>;
  onClose: (serial: Serial) => Promise<void>;
}

export class DeviceDoor {
  public channel: DeviceChannel | null = null;
  private _isLongClosed = false;
  private _error: Error | null = null;
  private _latestOpenTime = 0;
  private _firstCloseTime = 0;
  private _latestCloseTime = 0;

  constructor(public readonly driver: DeviceDriver, public scanInfo: DeviceScanInfo, private readonly callback: DeviceDoorEvent) {
    this.process().catch((error) => {
      logger.error(`DeviceDoor.process. serial: ${scanInfo.serial}, platform:${driver.platform} is error`, { error: stringify(error) });
    });
  }

  onScanned(scanInfo: DeviceScanInfo): void {
    this._firstCloseTime = 0;
    this._latestCloseTime = 0;
    this._latestOpenTime = Date.now();
    this.scanInfo = scanInfo;
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

  error(): Error | null {
    return this._error;
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
    if (null == this.channel && this.scanInfo.status === 'online' && this._latestCloseTime < this._latestOpenTime) {
      try {
        this.channel = await this.driver.openChannel({
          serial: this.scanInfo.serial,
          deviceAgentDevicePort: DeviceAgentPort,
          deviceAgentDeviceSecondPort: DeviceAgentSecondPort,
          deviceAgentDeviceThirdPort: DeviceAgentThirdPort,
        });
        this._error = null;
        await this.callback.onOpen(this.channel);
      } catch (error) {
        logger.error(`DeviceDoor.processInternal initChannel error serial:${this.scanInfo.serial} ${stringifyError(error)}`);
        this.channel = null;
        this._firstCloseTime = Date.now();
        this._latestCloseTime = Date.now();
        if (error instanceof Error) {
          this._error = error;
        } else {
          this._error = new Error(stringify(error));
        }
      }
      return;
    }

    if (this._latestOpenTime < this._latestCloseTime && 10000 < this._latestCloseTime - this._firstCloseTime) {
      this.channel = null;
      await this.driver.closeChannel(this.scanInfo.serial);
      await this.callback.onClose(this.scanInfo.serial);
      this._isLongClosed = true;
      return;
    }
  }
}

export class DeviceDoors {
  private _doors: DeviceDoor[] = [];

  constructor(private readonly callback: DeviceDoorEvent) {}

  consumeScanInfo(driver: DeviceDriver, scanInfo: DeviceScanInfo): void {
    this.cleanupClosedDoor();

    const platform = driver.platform;
    const door = this._doors.find((door) => door.driver.platform === platform && door.scanInfo.serial === scanInfo.serial);
    if (!door) {
      const newDoor = new DeviceDoor(driver, scanInfo, this.callback);
      this._doors.push(newDoor);
      newDoor.onScanned(scanInfo);
      return;
    }
    door.onScanned(scanInfo);
  }

  closeDoor(driver: DeviceDriver, serial: Serial): void {
    this.cleanupClosedDoor();

    const platform = driver.platform;
    const door = this._doors.find((door) => door.driver.platform === platform && door.scanInfo.serial === serial);
    if (!door) {
      logger.warn(`DeviceDoors.closeDoor. serial: ${serial}, platform:${platform} is not found`);
      return;
    }
    door.close();
  }

  get channels(): DeviceChannel[] {
    return this._doors.filter((door) => null !== door.channel && null === door.error() && door.scanInfo.status === 'online').map((door) => door.channel!);
  }

  get channelsWithError(): ErrorDevice[] {
    return this._doors
      .filter((door) => null != door.error() || door.scanInfo.status !== 'online')
      .map((door) => {
        const scanDescription = door.scanInfo.description ?? door.scanInfo.status;
        const error = door.scanInfo.status !== 'online' ? new Error(scanDescription) : door.error();
        return {
          platform: platformTypeFromPlatform(door.driver.platform),
          serial: door.scanInfo.serial,
          error: error ?? new Error('Unknown error'),
        };
      });
  }

  private cleanupClosedDoor(): void {
    this._doors = this._doors.filter((door) => !door.isLongClosed());
  }
}
