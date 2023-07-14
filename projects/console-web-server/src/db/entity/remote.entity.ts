import { RemoteBase, RemotePropSnake } from '@dogu-private/console';
import { ProjectId, RemoteId, REMOTE_TABLE_NAME, REMOTE_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { RemoteDeviceJob } from './remote-device-job.entity';

@Entity(REMOTE_TABLE_NAME)
export class Remote extends BaseEntity implements RemoteBase {
  @PrimaryColumn({ type: 'uuid', name: RemotePropSnake.remote_id })
  remoteId!: RemoteId;

  @ColumnTemplate.RelationUuid(RemotePropSnake.project_id)
  projectId!: ProjectId;

  // @Column({ type: 'character varying', name: `${RemotePropSnake.runs_on}`, nullable: false })
  // runsOn!: string;

  @Column({ type: 'smallint', name: RemotePropSnake.type, default: REMOTE_TYPE.UNSPECIFIED, nullable: false })
  type!: REMOTE_TYPE;

  @ColumnTemplate.CreateDate(RemotePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RemotePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RemotePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => RemoteDeviceJob, (remoteDeviceJob) => remoteDeviceJob.remote, { cascade: ['soft-remove'] })
  remoteDeviceJobs?: RemoteDeviceJob[];
}
