import { ProjectScmGitlabAuthBase, ProjectScmGitlabAuthPropCamel, ProjectScmGitlabAuthPropSnake } from '@dogu-private/console';
import { ProjectScmGitlabAuthId, ProjectScmId, PROJECT_SCM_GITLAB_AUTH_TABLE_NAME } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { ProjectScm } from './project-scm';

@Entity(PROJECT_SCM_GITLAB_AUTH_TABLE_NAME)
export class ProjectScmGitlabAuth extends BaseEntity implements ProjectScmGitlabAuthBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectScmGitlabAuthPropSnake.project_scm_gitlab_auth_id, nullable: false })
  projectScmGitlabAuthId!: ProjectScmGitlabAuthId;

  @ColumnTemplate.RelationUuid(ProjectScmGitlabAuthPropSnake.project_scm_id)
  projectScmId!: ProjectScmId;

  @Exclude()
  @Column({ type: 'character varying', name: ProjectScmGitlabAuthPropSnake.token, nullable: false })
  token!: string;

  @ColumnTemplate.CreateDate(ProjectScmGitlabAuthPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectScmGitlabAuthPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectScmGitlabAuthPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => ProjectScm, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectScmGitlabAuthPropSnake.project_scm_id, referencedColumnName: ProjectScmGitlabAuthPropCamel.projectScmId })
  projectScm?: ProjectScm;
}
