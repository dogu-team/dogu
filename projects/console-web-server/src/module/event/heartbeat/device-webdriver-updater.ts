import { DeviceWebDriver } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { Device, DeviceAndWebDriver } from '../../../db/entity/index';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class DeviceWebDriverUpdater {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, private readonly deviceMessageRelayer: DeviceMessageRelayer, private readonly logger: DoguLogger) {}

  public async update(): Promise<void> {
    this.updateSessionsToDeletedByHeartbeat();
  }

  private async updateSessionsToDeletedByHeartbeat(): Promise<void> {
    const deviceAndWebDrivers = await this.dataSource.getRepository(DeviceAndWebDriver).find({ where: {}, withDeleted: false });
    if (deviceAndWebDrivers.length === 0) {
      return;
    }
    const targets = deviceAndWebDrivers.filter((deviceAndWebDriver) => {
      return deviceAndWebDriver.heartbeat === null || config.deviceAndWebDriver.heartbeat.allowedSeconds * 1000 < Date.now() - deviceAndWebDriver.heartbeat.getTime();
    });

    if (targets.length === 0) {
      return;
    }

    await this.dataSource.getRepository(DeviceAndWebDriver).softRemove(targets);
    for (const target of targets) {
      const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId: target.deviceId } });
      if (!device) {
        return;
      }
      const pathProvider = new DeviceWebDriver.sessionDeleted.pathProvider(device.serial);
      const path = DeviceWebDriver.sessionDeleted.resolvePath(pathProvider);
      const res = await this.deviceMessageRelayer.sendHttpRequest(
        device.organizationId,
        device.deviceId,
        DeviceWebDriver.sessionDeleted.method,
        path,
        undefined,
        undefined,
        { sessionId: target.sessionId },
        DeviceWebDriver.sessionDeleted.responseBody,
      );
    }
  }
}
