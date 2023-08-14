import { ProjectSlackRemoteBase, ProjectSlackRemotePropCamel, ProjectSlackRemotePropSnake } from '@dogu-private/console';
import { ProjectId, PROJECT_REMOTE_SLACK_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';

@Entity(PROJECT_REMOTE_SLACK_TABLE_NAME)
export class ProjectSlackRemote extends BaseEntity implements ProjectSlackRemoteBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectSlackRemotePropSnake.project_id })
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: ProjectSlackRemotePropSnake.channel_id, nullable: false })
  channelId!: string;

  @Column({ type: 'smallint', name: ProjectSlackRemotePropSnake.on_success, nullable: false })
  onSuccess!: number;

  @Column({ type: 'smallint', name: ProjectSlackRemotePropSnake.on_failure, nullable: false })
  onFailure!: number;

  @ColumnTemplate.CreateDate(ProjectSlackRemotePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectSlackRemotePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectSlackRemotePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, (project) => project.projectSlackRemote, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: ProjectSlackRemotePropSnake.project_id, //
    referencedColumnName: ProjectSlackRemotePropCamel.projectId,
  })
  project?: Project;
}
