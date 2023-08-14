import { ProjectSlackRoutineBase, ProjectSlackRoutinePropCamel, ProjectSlackRoutinePropSnake } from '@dogu-private/console/src/base/project-slack-routine';
import { ProjectId, PROJECT_ROUTINE_SLACK_TABLE_NAME, RoutineId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';

@Entity(PROJECT_ROUTINE_SLACK_TABLE_NAME)
export class ProjectSlackRoutine extends BaseEntity implements ProjectSlackRoutineBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectSlackRoutinePropSnake.project_id })
  projectId!: ProjectId;

  @PrimaryColumn({ type: 'uuid', name: ProjectSlackRoutinePropSnake.routine_id })
  routineId!: RoutineId;

  @Column({ type: 'character varying', name: ProjectSlackRoutinePropSnake.channel_id, nullable: false })
  channelId!: string;

  @Column({ type: 'smallint', name: ProjectSlackRoutinePropSnake.on_success, nullable: false })
  onSuccess!: number;

  @Column({ type: 'smallint', name: ProjectSlackRoutinePropSnake.on_failure, nullable: false })
  onFailure!: number;

  @ColumnTemplate.CreateDate(ProjectSlackRoutinePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectSlackRoutinePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectSlackRoutinePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, (project) => project.projectSlackRemote, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: ProjectSlackRoutinePropSnake.project_id, //
    referencedColumnName: ProjectSlackRoutinePropCamel.projectId,
  })
  project?: Project;
}
