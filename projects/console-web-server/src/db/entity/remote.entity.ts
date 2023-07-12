import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { RemoteBase, RemotePropSnake } from '@dogu-private/console/src/base/remote';
import { DeviceId, RemoteId, REMOTE_TABLE_NAME, REMOTE_TYPE } from '@dogu-private/types';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';

@Entity(REMOTE_TABLE_NAME)
export class Remote extends BaseEntity implements RemoteBase {
  @PrimaryColumn({ type: 'uuid', name: RemotePropSnake.remote_id })
  remoteId!: RemoteId;

  @ColumnTemplate.RelationUuid(RemotePropSnake.device_id)
  deviceId!: DeviceId;

  @Column({ type: 'smallint', name: RemotePropSnake.type, default: REMOTE_TYPE.UNSPECIFIED, nullable: false })
  type!: REMOTE_TYPE;

  @ColumnTemplate.Date(RemotePropSnake.heartbeat, true)
  heartbeat!: Date | null;

  @ColumnTemplate.CreateDate(RemotePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RemotePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RemotePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RemotePropSnake.device_id })
  device?: Device;
}
