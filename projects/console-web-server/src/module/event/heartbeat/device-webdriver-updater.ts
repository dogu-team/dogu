import { DeviceAndWebDriverPropSnake } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { DeviceAndWebDriver } from '../../../db/entity/index';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class DeviceWebDriverUpdater {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, private readonly logger: DoguLogger) {}

  public update(): void {
    this.updateSessionsToDeletedByHeartbeat();
  }

  private updateSessionsToDeletedByHeartbeat(): void {
    this.dataSource
      .createQueryBuilder()
      .update(DeviceAndWebDriver)
      .set({ deletedAt: new Date() })
      .andWhere(`${DeviceAndWebDriverPropSnake.heartbeat} IS NOT NULL`)
      .andWhere(`${DeviceAndWebDriverPropSnake.deleted_at} IS NULL`)
      .andWhere(`${DeviceAndWebDriverPropSnake.heartbeat} < NOW() - INTERVAL '${config.deviceAndWebDriver.heartbeat.allowedSeconds} seconds'`)
      .execute()
      .catch((error) => {
        this.logger.error(stringify(error));
      });
  }
}
