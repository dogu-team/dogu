import { GitlabRepositoryAuthBase, GitlabRepositoryAuthPropCamel, GitlabRepositoryAuthPropSnake } from '@dogu-private/console';
import { GitlabRepositoryAuthId, GITLAB_REPOSITORY_AUTH_TABLE_NAME, ProjectRepositoryId } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { ProjectRepository } from './project-repository';

@Entity(GITLAB_REPOSITORY_AUTH_TABLE_NAME)
export class GitlabRepositoryAuth extends BaseEntity implements GitlabRepositoryAuthBase {
  @PrimaryColumn({ type: 'uuid', name: GitlabRepositoryAuthPropSnake.gitlab_repository_auth_id, nullable: false })
  gitlabRepositoryAuthId!: GitlabRepositoryAuthId;

  @ColumnTemplate.RelationUuid(GitlabRepositoryAuthPropSnake.project_repository_id)
  projectRepositoryId!: ProjectRepositoryId;

  @Exclude()
  @Column({ type: 'character varying', name: GitlabRepositoryAuthPropSnake.token, nullable: true })
  token!: string | null;

  @ColumnTemplate.CreateDate(GitlabRepositoryAuthPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(GitlabRepositoryAuthPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(GitlabRepositoryAuthPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => ProjectRepository, { createForeignKeyConstraints: false })
  @JoinColumn({ name: GitlabRepositoryAuthPropSnake.project_repository_id, referencedColumnName: GitlabRepositoryAuthPropCamel.projectRepositoryId })
  projectRepository?: ProjectRepository;
}
