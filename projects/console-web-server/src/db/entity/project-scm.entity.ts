import { ProjectScmBase, ProjectScmBasePropCamel, ProjectScmBasePropSnake } from '@dogu-private/console';
import { ProjectId, ProjectScmId, PROJECT_SCM_TABLE_NAME, PROJECT_SCM_TYPE } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';

/**
 * @deprecated Git integration is moved to organization
 */
@Entity(PROJECT_SCM_TABLE_NAME)
export class ProjectScm extends BaseEntity implements ProjectScmBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectScmBasePropSnake.project_scm_id, nullable: false })
  projectScmId!: ProjectScmId;

  @ColumnTemplate.RelationUuid(ProjectScmBasePropSnake.project_id)
  projectId!: ProjectId;

  @Column({ type: 'smallint', name: ProjectScmBasePropSnake.type, default: PROJECT_SCM_TYPE.UNSPECIFIED, nullable: false })
  type!: PROJECT_SCM_TYPE;

  @Column({ type: 'character varying', name: ProjectScmBasePropSnake.url, nullable: false })
  url!: string;

  @ColumnTemplate.CreateDate(ProjectScmBasePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectScmBasePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectScmBasePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectScmBasePropSnake.project_id, referencedColumnName: ProjectScmBasePropCamel.projectId })
  project?: Project;
}
