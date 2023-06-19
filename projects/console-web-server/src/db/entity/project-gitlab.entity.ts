import { GitlabGroupId, GitlabProjectId, GitlabProjectToken, ProjectGitlabBase, ProjectGitlabPropCamel, ProjectGitlabPropSnake } from '@dogu-private/console';
import { ProjectId, PROJECT_GITLBA_TABLE_NAME, PROJECT_GITLBA_TOKEN_LENGTH } from '@dogu-private/types';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';

@Entity(PROJECT_GITLBA_TABLE_NAME)
export class ProjectGitlab implements ProjectGitlabBase {
  @PrimaryColumn('uuid', { name: ProjectGitlabPropSnake.project_id })
  projectId!: ProjectId;

  @Column({ type: 'int', name: ProjectGitlabPropSnake.gitlab_group_id, nullable: false })
  gitlabGroupId!: GitlabGroupId;

  @Column({ type: 'int', name: ProjectGitlabPropSnake.gitlab_project_id, nullable: false })
  gitlabProjectId!: GitlabProjectId;

  @Column({ type: 'character varying', name: ProjectGitlabPropSnake.gitlab_project_token, length: PROJECT_GITLBA_TOKEN_LENGTH, nullable: false })
  gitlabProjectToken!: GitlabProjectToken;

  @ColumnTemplate.CreateDate(ProjectGitlabPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectGitlabPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectGitlabPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Project, (project) => project.gitlab, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: ProjectGitlabPropSnake.project_id,
    referencedColumnName: ProjectGitlabPropCamel.projectId,
  })
  project?: Project;
}
