import { ProjectAccessTokenBase, ProjectAccessTokenPropSnake, ProjectPropCamel, TokenPropCamel, TokenPropSnake, UserPropCamel } from '@dogu-private/console';
import { ProjectAccessTokenId, ProjectId, PROJECT_ACCESS_TOKEN_TABLE_NAME, TokenId, UserId } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Project } from './project.entity';
import { Token } from './token.entity';
import { User } from './user.entity';

@Entity(PROJECT_ACCESS_TOKEN_TABLE_NAME)
export class ProjectAccessToken extends BaseEntity implements ProjectAccessTokenBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectAccessTokenPropSnake.project_access_token_id, nullable: false })
  projectAccessTokenId!: ProjectAccessTokenId;

  @ColumnTemplate.RelationUuid(ProjectAccessTokenPropSnake.project_id)
  projectId!: ProjectId;

  @Exclude()
  @ColumnTemplate.RelationUuid(ProjectAccessTokenPropSnake.token_id)
  tokenId!: TokenId;

  @ColumnTemplate.RelationUuid(ProjectAccessTokenPropSnake.creator_id, true)
  creatorId!: UserId | null;

  @ColumnTemplate.RelationUuid(ProjectAccessTokenPropSnake.revoker_id, true)
  revokerId!: UserId | null;

  @ColumnTemplate.CreateDate(ProjectAccessTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectAccessTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectAccessTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: ProjectAccessTokenPropSnake.creator_id, referencedColumnName: UserPropCamel.userId })
  creator?: User;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: ProjectAccessTokenPropSnake.revoker_id, referencedColumnName: UserPropCamel.userId })
  revoker?: User;

  @Exclude()
  @ManyToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: TokenPropSnake.token_id, referencedColumnName: TokenPropCamel.tokenId })
  token!: Token;

  @OneToOne(() => Project, { createForeignKeyConstraints: false })
  @JoinColumn({
    name: ProjectAccessTokenPropSnake.project_id, //
    referencedColumnName: ProjectPropCamel.projectId,
  })
  project?: Project;
}
