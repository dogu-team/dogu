import { RemoteDestBase, RemoteDestPropSnake } from '@dogu-private/console';
import { DEST_STATE, DEST_TYPE, RemoteDestId, RemoteDeviceJobId, REMOTE_DEST_NAME_MAX_LENGTH, REMOTE_DEST_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { RemoteDestEdge } from './relations/remote-dest-edge.entity';
import { RemoteDeviceJob } from './remote-device-job.entity';

@Entity(REMOTE_DEST_TABLE_NAME)
export class RemoteDest extends BaseEntity implements RemoteDestBase {
  @PrimaryColumn({ type: 'uuid', name: RemoteDestPropSnake.remote_dest_id })
  remoteDestId!: RemoteDestId;

  @ColumnTemplate.RelationUuid(RemoteDestPropSnake.remote_device_job_id)
  remoteDeviceJobId!: RemoteDeviceJobId;

  @Column({ type: 'character varying', name: RemoteDestPropSnake.name, length: REMOTE_DEST_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: RemoteDestPropSnake.state, default: DEST_STATE.PENDING, unsigned: true, nullable: false })
  state!: DEST_STATE;

  @Column({ type: 'int', name: RemoteDestPropSnake.index, unsigned: true, nullable: false })
  index!: number;

  @Column({ type: 'smallint', name: RemoteDestPropSnake.type, unsigned: true, nullable: false })
  type!: DEST_TYPE;

  @ColumnTemplate.CreateDate(RemoteDestPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.Date(RemoteDestPropSnake.local_in_progress_at, true)
  localInProgressAt!: Date | null;

  @ColumnTemplate.Date(RemoteDestPropSnake.local_completed_at, true)
  localCompletedAt!: Date | null;

  @ColumnTemplate.UpdateDate(RemoteDestPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RemoteDestPropSnake.deleted_at)
  deletedAt!: Date | null;

  /**
   * @description received from client's local time
   */
  @ColumnTemplate.Date(RemoteDestPropSnake.in_progress_at, true)
  inProgressAt!: Date | null;

  /**
   * @description received from client's local time
   */
  @ColumnTemplate.Date(RemoteDestPropSnake.completed_at, true)
  completedAt!: Date | null;

  @OneToMany(() => RemoteDestEdge, (remoteDestEdge) => remoteDestEdge.remoteDest, { cascade: ['soft-remove'] })
  remoteDestEdges?: RemoteDestEdge[];

  @ManyToOne(() => RemoteDeviceJob, (remoteDeviceJob) => remoteDeviceJob.remoteDests, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: `${RemoteDestPropSnake.remote_device_job_id}` })
  remoteDeviceJob?: RemoteDeviceJob;

  children?: RemoteDest[];
}
