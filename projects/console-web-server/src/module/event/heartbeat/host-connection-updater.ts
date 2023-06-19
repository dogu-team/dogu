import { HostPropSnake } from '@dogu-private/console';
import { HostConnectionState } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { config } from '../../../config';
import { Host } from '../../../db/entity/host.entity';
import { DoguLogger } from '../../logger/logger';

@Injectable()
export class HostConnectionUpdater {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, private readonly logger: DoguLogger) {}

  public update(): void {
    this.updateHostsToConnectedByHeartbeat();
    this.updateHostsToDisconnectedByHeartbeat();
  }

  private updateHostsToConnectedByHeartbeat(): void {
    this.dataSource
      .createQueryBuilder()
      .update(Host)
      .set({ connectionState: HostConnectionState.HOST_CONNECTION_STATE_CONNECTED })
      .where({ connectionState: HostConnectionState.HOST_CONNECTION_STATE_DISCONNECTED })
      .andWhere(`${HostPropSnake.heartbeat} IS NOT NULL`)
      .andWhere(`${HostPropSnake.deleted_at} IS NULL`)
      .andWhere(`${HostPropSnake.heartbeat} > NOW() - INTERVAL '${config.host.heartbeat.allowedSeconds} SECONDS'`)
      .execute()
      .catch((error) => {
        this.logger.error(stringify(error));
      });
  }

  private updateHostsToDisconnectedByHeartbeat(): void {
    this.dataSource
      .createQueryBuilder()
      .update(Host)
      .set({ connectionState: HostConnectionState.HOST_CONNECTION_STATE_DISCONNECTED })
      .where({ connectionState: HostConnectionState.HOST_CONNECTION_STATE_CONNECTED })
      .andWhere(`${HostPropSnake.heartbeat} IS NOT NULL`)
      .andWhere(`${HostPropSnake.deleted_at} IS NULL`)
      .andWhere(`${HostPropSnake.heartbeat} < NOW() - INTERVAL '${config.host.heartbeat.allowedSeconds} SECONDS'`)
      .execute()
      .catch((error) => {
        this.logger.error(stringify(error));
      });
  }
}
