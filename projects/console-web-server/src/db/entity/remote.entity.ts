import { RemoteBase, RemotePropSnake } from '@dogu-private/console';
import { CREATOR_TYPE, ProjectId, RemoteId, REMOTE_TABLE_NAME, REMOTE_TYPE, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { RemoteDeviceJob } from './remote-device-job.entity';
import { User } from './user.entity';

@Entity(REMOTE_TABLE_NAME)
export class Remote extends BaseEntity implements RemoteBase {
  @PrimaryColumn({ type: 'uuid', name: RemotePropSnake.remote_id })
  remoteId!: RemoteId;

  @ColumnTemplate.RelationUuid(RemotePropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'smallint', name: RemotePropSnake.type, default: REMOTE_TYPE.UNSPECIFIED, nullable: false })
  type!: REMOTE_TYPE;

  @Column({ type: 'smallint', name: RemotePropSnake.creator_type, default: CREATOR_TYPE.UNSPECIFIED, nullable: false })
  creatorType!: CREATOR_TYPE;

  @ColumnTemplate.RelationUuid(RemotePropSnake.creator_id, true)
  creatorId!: UserId | null;

  @Column({ type: 'json', name: RemotePropSnake.dogu_options, default: '{}', nullable: false })
  doguOptions!: Record<string, unknown>;

  @ColumnTemplate.CreateDate(RemotePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(RemotePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(RemotePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: RemotePropSnake.creator_id })
  creator?: User;

  @OneToMany(() => RemoteDeviceJob, (remoteDeviceJob) => remoteDeviceJob.remote, { cascade: ['soft-remove'] })
  remoteDeviceJobs?: RemoteDeviceJob[];
}
