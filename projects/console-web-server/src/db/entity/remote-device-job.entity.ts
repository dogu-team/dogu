import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { RemoteDeviceJobBase, RemoteDeviceJobPropSnake, RemotePropCamel } from '@dogu-private/console';
import { DeviceId, RemoteDeviceJobId, RemoteId, REMOTE_DEVICE_JOB_SESSION_STATE, REMOTE_DEVICE_JOB_TABLE_NAME, WebDriverSessionId } from '@dogu-private/types';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { RemoteDest } from './remote-dest.entity';
import { Remote } from './remote.entity';

@Entity(REMOTE_DEVICE_JOB_TABLE_NAME)
export class RemoteDeviceJob extends BaseEntity implements RemoteDeviceJobBase {
  @PrimaryColumn({ type: 'uuid', name: RemoteDeviceJobPropSnake.remote_device_job_id })
  remoteDeviceJobId!: RemoteDeviceJobId;

  @ColumnTemplate.RelationUuid(RemoteDeviceJobPropSnake.remote_id)
  remoteId!: RemoteId;

  @ColumnTemplate.RelationUuid(RemoteDeviceJobPropSnake.device_id)
  deviceId!: DeviceId;

  @Column({ type: 'uuid', name: RemoteDeviceJobPropSnake.session_id, nullable: true, unique: true })
  sessionId!: WebDriverSessionId | null;

  @Column({ type: 'smallint', name: RemoteDeviceJobPropSnake.session_state, default: REMOTE_DEVICE_JOB_SESSION_STATE.WAITING, nullable: false })
  sessionState!: REMOTE_DEVICE_JOB_SESSION_STATE;

  @Column({ type: 'int', name: RemoteDeviceJobPropSnake.interval_timeout, default: 300000, nullable: false })
  intervalTimeout!: number;

  @ColumnTemplate.Date(RemoteDeviceJobPropSnake.last_interval_time, true)
  lastIntervalTime!: Date;

  @ColumnTemplate.CreateDate(RemoteDeviceJobPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RemoteDeviceJobPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RemoteDeviceJobPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ColumnTemplate.Date(RemoteDeviceJobPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  @ColumnTemplate.Date(RemoteDeviceJobPropSnake.completed_at, true)
  completedAt!: Date | null;

  @ManyToOne(() => Remote, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RemoteDeviceJobPropSnake.remote_id, referencedColumnName: RemotePropCamel.remoteId })
  remote?: Remote;

  @ManyToOne(() => Device, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: RemoteDeviceJobPropSnake.device_id })
  device?: Device;

  @OneToMany(() => RemoteDest, (remoteDest) => remoteDest.remoteDeviceJob, { cascade: ['soft-remove'] })
  remoteDests?: RemoteDest[];
}
