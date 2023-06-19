import { DevicePropSnake, RoutineStepPropSnake } from '@dogu-private/console';
import { DeviceConnectionState } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { Device } from '../../../db/entity/device.entity';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class DeviceConnectionUpdater {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, private readonly logger: DoguLogger) {}

  public update(): void {
    this.updateDevicesToConnectedByHeartbeat();
    this.updateDevicesToDisconnectedByHeartbeat();
  }

  private updateDevicesToConnectedByHeartbeat(): void {
    this.dataSource
      .createQueryBuilder()
      .update(Device)
      .set({ connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED })
      .where({ connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED })
      .andWhere(`${DevicePropSnake.heartbeat} IS NOT NULL`)
      .andWhere(`${DevicePropSnake.deleted_at} IS NULL`)
      .andWhere(`${DevicePropSnake.heartbeat} > NOW() - INTERVAL '${config.device.heartbeat.allowedSeconds} seconds'`)
      .execute()
      .catch((error) => {
        this.logger.error(stringify(error));
      });
  }

  private updateDevicesToDisconnectedByHeartbeat(): void {
    this.dataSource
      .createQueryBuilder()
      .update(Device)
      .set({ connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED })
      .where({ connectionState: DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED })
      .andWhere(`${RoutineStepPropSnake.heartbeat} IS NOT NULL`)
      .andWhere(`${DevicePropSnake.deleted_at} IS NULL`)
      .andWhere(`${DevicePropSnake.heartbeat} < NOW() - INTERVAL '${config.device.heartbeat.allowedSeconds} seconds'`)
      .execute()
      .catch((error) => {
        this.logger.error(stringify(error));
      });
  }
}
