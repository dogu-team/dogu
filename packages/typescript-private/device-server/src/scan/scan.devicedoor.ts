import { DeviceAgentPort, DeviceAgentSecondPort, DeviceAgentThirdPort, Serial } from '@dogu-private/types';
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
  private isBroken = false;
  private latestOpenTime = 0;
  private firstCloseTime = 0;
  private latestCloseTime = 0;

  constructor(public readonly driver: DeviceDriver, public readonly serial: Serial, private readonly callback: DeviceDoorEvent) {
    this.process().catch((error) => {
      logger.error(`DeviceDoor.process. serial: ${serial}, platform:${driver.platform} is error`, { error: stringify(error) });
    });
  }

  openDoorIfNotActive(): void {
    this.firstCloseTime = 0;
    this.latestCloseTime = 0;
    this.latestOpenTime = Date.now();
  }

  close(): void {
    this.latestOpenTime = 0;
    if (0 == this.firstCloseTime) {
      this.firstCloseTime = Date.now();
    }
    this.latestCloseTime = Date.now();
  }

  isBrokenDoor(): boolean {
    return this.isBroken;
  }

  private async process(): Promise<void> {
    for await (const _ of loop(1000)) {
      await this.processInternal();
      if (this.isBroken) {
        return;
      }
    }
  }

  private async processInternal(): Promise<void> {
    if (null == this.channel && this.latestCloseTime < this.latestOpenTime) {
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
        this.isBroken = true;
      }
      return;
    }

    if (this.latestOpenTime < this.latestCloseTime && 10000 < this.latestCloseTime - this.firstCloseTime) {
      this.channel = null;
      await this.driver.closeChannel(this.serial);
      await this.callback.onClose(this.serial);
      this.isBroken = true;
      return;
    }
  }
}

export class DeviceDoors {
  private doors: DeviceDoor[] = [];

  constructor(private readonly callback: DeviceDoorEvent) {}

  openDoorIfNotActive(driver: DeviceDriver, serial: Serial): void {
    this.cleanupDoor();

    const platform = driver.platform;
    const door = this.doors.find((door) => door.driver.platform === platform && door.serial === serial);
    if (!door) {
      const newDoor = new DeviceDoor(driver, serial, this.callback);
      this.doors.push(newDoor);
      newDoor.openDoorIfNotActive();
      return;
    }
    door.openDoorIfNotActive();
  }

  closeDoor(driver: DeviceDriver, serial: Serial): void {
    this.cleanupDoor();

    const platform = driver.platform;
    const door = this.doors.find((door) => door.driver.platform === platform && door.serial === serial);
    if (!door) {
      logger.warn(`DeviceDoors.closeDoor. serial: ${serial}, platform:${platform} is not found`);
      return;
    }
    door.close();
  }

  get channels(): DeviceChannel[] {
    return this.doors.map((door) => door.channel).filter((channel) => null != channel) as DeviceChannel[];
  }

  private cleanupDoor(): void {
    this.doors = this.doors.filter((door) => !door.isBrokenDoor());
  }
}
