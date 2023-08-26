import { ProjectScmGithubAuthPropCamel, ProjectScmGithubAuthPropSnake } from '@dogu-private/console';
import { ProjectScmBitBucketAuthBase } from '@dogu-private/console/src/base/project-scm-bitbucket-auth';
import { ProjectScmBitBucketAuthId, ProjectScmId, PROJECT_SCM_BITBUCKET_AUTH_TABLE_NAME } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { ProjectScm } from './project-scm.entity';

@Entity(PROJECT_SCM_BITBUCKET_AUTH_TABLE_NAME)
export class ProjectScmBitBucketAuth extends BaseEntity implements ProjectScmBitBucketAuthBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectScmGithubAuthPropSnake.project_scm_github_auth_id, nullable: false })
  projectScmBitBucketAuthId!: ProjectScmBitBucketAuthId;

  @ColumnTemplate.RelationUuid(ProjectScmGithubAuthPropSnake.project_scm_id)
  projectScmId!: ProjectScmId;

  @Exclude()
  @Column({ type: 'character varying', name: ProjectScmGithubAuthPropSnake.token, nullable: false })
  token!: string;

  @ColumnTemplate.CreateDate(ProjectScmGithubAuthPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectScmGithubAuthPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectScmGithubAuthPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => ProjectScm, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectScmGithubAuthPropSnake.project_scm_id, referencedColumnName: ProjectScmGithubAuthPropCamel.projectScmId })
  projectScm?: ProjectScm;
}
