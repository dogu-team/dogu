import { GithubRepositoryAuthBase, GithubRepositoryAuthPropCamel, GithubRepositoryAuthPropSnake } from '@dogu-private/console';
import { GithubRepositoryAuthId, GITHUB_REPOSITORY_AUTH_TABLE_NAME, ProjectRepositoryId } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { ProjectRepository } from './project-repository';

@Entity(GITHUB_REPOSITORY_AUTH_TABLE_NAME)
export class GithubRepositoryAuth extends BaseEntity implements GithubRepositoryAuthBase {
  @PrimaryColumn({ type: 'uuid', name: GithubRepositoryAuthPropSnake.github_repository_auth_id, nullable: false })
  githubRepositoryAuthId!: GithubRepositoryAuthId;

  @ColumnTemplate.RelationUuid(GithubRepositoryAuthPropSnake.project_repository_id)
  projectRepositoryId!: ProjectRepositoryId;

  @Exclude()
  @Column({ type: 'character varying', name: GithubRepositoryAuthPropSnake.token, nullable: true })
  token!: string | null;

  @ColumnTemplate.CreateDate(GithubRepositoryAuthPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(GithubRepositoryAuthPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(GithubRepositoryAuthPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => ProjectRepository, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: GithubRepositoryAuthPropSnake.project_repository_id, referencedColumnName: GithubRepositoryAuthPropCamel.projectRepositoryId })
  projectRepository?: ProjectRepository;
}
