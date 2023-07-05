import { ProjectRepositoryBase, ProjectRepositoryBasePropCamel, ProjectRepositoryBasePropSnake } from '@dogu-private/console';
import { ProjectId, ProjectRepositoryId, PROJECT_REPOSITORY_TABLE_NAME, REPOSITORY_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';

@Entity(PROJECT_REPOSITORY_TABLE_NAME)
export class ProjectRepository extends BaseEntity implements ProjectRepositoryBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectRepositoryBasePropSnake.project_repository_id, nullable: false })
  projectRepositoryId!: ProjectRepositoryId;

  @ColumnTemplate.RelationUuid(ProjectRepositoryBasePropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'smallint', name: ProjectRepositoryBasePropSnake.repository_type, default: REPOSITORY_TYPE.UNSPECIFIED, nullable: false })
  repositoryType!: REPOSITORY_TYPE;

  @Column({ type: 'character varying', name: ProjectRepositoryBasePropSnake.url, nullable: false })
  url!: string;

  @ColumnTemplate.CreateDate(ProjectRepositoryBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectRepositoryBasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectRepositoryBasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectRepositoryBasePropSnake.project_id, referencedColumnName: ProjectRepositoryBasePropCamel.projectId })
  project?: Project;
}
