import { OrganizationAccessTokenBase, OrganizationApiTokenPropCamel, OrganizationApiTokenPropSnake, TokenPropCamel, TokenPropSnake, UserPropCamel } from '@dogu-private/console';
import { OrganizationAccessTokenId, OrganizationId, ORGANIZATION_ACCESS_TOKEN_TABLE_NAME, TokenId, UserId } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';
import { Token } from './token.entity';
import { User } from './user.entity';

@Entity(ORGANIZATION_ACCESS_TOKEN_TABLE_NAME)
export class OrganizatioAccessToken extends BaseEntity implements OrganizationAccessTokenBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationApiTokenPropSnake.organization_access_token_id, nullable: false })
  organizationAccessTokenId!: OrganizationAccessTokenId;

  @ColumnTemplate.RelationUuid(OrganizationApiTokenPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Exclude()
  @ColumnTemplate.RelationUuid(OrganizationApiTokenPropSnake.token_id)
  tokenId!: TokenId;

  @ColumnTemplate.RelationUuid(OrganizationApiTokenPropSnake.creator_id, true)
  creatorId!: UserId | null;

  @ColumnTemplate.RelationUuid(OrganizationApiTokenPropSnake.revoker_id, true)
  revokerId!: UserId | null;

  @ColumnTemplate.CreateDate(OrganizationApiTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationApiTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationApiTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: OrganizationApiTokenPropSnake.creator_id, referencedColumnName: UserPropCamel.userId })
  creator?: User;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: OrganizationApiTokenPropSnake.revoker_id, referencedColumnName: UserPropCamel.userId })
  revoker?: User;

  @Exclude()
  @ManyToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: TokenPropSnake.token_id, referencedColumnName: TokenPropCamel.tokenId })
  token!: Token;

  @OneToOne(() => Organization, { createForeignKeyConstraints: false })
  @JoinColumn({
    name: OrganizationApiTokenPropSnake.organization_id, //
    referencedColumnName: OrganizationApiTokenPropCamel.organizationId,
  })
  organization?: Organization;
}
