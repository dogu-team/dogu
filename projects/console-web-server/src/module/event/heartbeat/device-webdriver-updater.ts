import { DeviceWebDriver } from '@dogu-tech/device-client-common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { Device } from '../../../db/entity/index';
import { RemoteWebDriverInfo } from '../../../db/entity/remote-webdriver-info.entity';
import { Remote } from '../../../db/entity/remote.entity';
import { DeviceMessageRelayer } from '../../device-message/device-message.relayer';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class DeviceWebDriverUpdater {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, //
    private readonly deviceMessageRelayer: DeviceMessageRelayer,
    private readonly logger: DoguLogger,
  ) {}

  public async update(): Promise<void> {
    this.updateSessionsToDeletedByHeartbeat();
  }

  private async updateSessionsToDeletedByHeartbeat(): Promise<void> {
    const remotes = await this.dataSource.getRepository(Remote).find({ where: {}, withDeleted: false });
    if (remotes.length === 0) {
      return;
    }
    const targets = remotes.filter((remote) => {
      const heartbeatDelta = remote.heartbeat ? Date.now() - remote.heartbeat.getTime() : Date.now() - remote.createdAt.getTime();
      if (config.deviceAndWebDriver.heartbeat.allowedSeconds * 1000 < heartbeatDelta) {
        return true;
      }
      const lifeTimeDelta = Date.now() - remote.createdAt.getTime();
      if (config.deviceAndWebDriver.lifetime.allowedSeconds * 1000 < lifeTimeDelta) {
        return true;
      }
      return false;
    });

    if (targets.length === 0) {
      return;
    }

    await this.dataSource.getRepository(Remote).softRemove(targets);
    for (const target of targets) {
      const device = await this.dataSource.getRepository(Device).findOne({ where: { deviceId: target.deviceId } });
      if (!device) {
        return;
      }

      const remoteWdaInfo = await this.dataSource.getRepository(RemoteWebDriverInfo).findOne({ where: { remoteId: target.remoteId } });
      if (!remoteWdaInfo) {
        throw new Error(`RemoteWebDriverInfo not found. remoteId: ${target.remoteId}`);
      }

      const sessionId = remoteWdaInfo.sessionId;

      const pathProvider = new DeviceWebDriver.sessionDeleted.pathProvider(device.serial);
      const path = DeviceWebDriver.sessionDeleted.resolvePath(pathProvider);
      const res = await this.deviceMessageRelayer.sendHttpRequest(
        device.organizationId,
        device.deviceId,
        DeviceWebDriver.sessionDeleted.method,
        path,
        undefined,
        undefined,
        { sessionId },
        DeviceWebDriver.sessionDeleted.responseBody,
      );
    }
  }
}
