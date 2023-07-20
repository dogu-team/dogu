import {
  OrganizationAccessTokenBase,
  OrganizationAccessTokenPropCamel,
  OrganizationAccessTokenPropSnake,
  TokenPropCamel,
  TokenPropSnake,
  UserPropCamel,
} from '@dogu-private/console';
import { OrganizationAccessTokenId, OrganizationId, ORGANIZATION_ACCESS_TOKEN_TABLE_NAME, TokenId, UserId } from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';
import { Token } from './token.entity';
import { User } from './user.entity';

@Entity(ORGANIZATION_ACCESS_TOKEN_TABLE_NAME)
export class OrganizatioAccessToken extends BaseEntity implements OrganizationAccessTokenBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationAccessTokenPropSnake.organization_access_token_id, nullable: false })
  organizationAccessTokenId!: OrganizationAccessTokenId;

  @ColumnTemplate.RelationUuid(OrganizationAccessTokenPropSnake.organization_id)
  organizationId!: OrganizationId;

  @Exclude()
  @ColumnTemplate.RelationUuid(OrganizationAccessTokenPropSnake.token_id)
  tokenId!: TokenId;

  @ColumnTemplate.RelationUuid(OrganizationAccessTokenPropSnake.creator_id, true)
  creatorId!: UserId | null;

  @ColumnTemplate.RelationUuid(OrganizationAccessTokenPropSnake.revoker_id, true)
  revokerId!: UserId | null;

  @ColumnTemplate.CreateDate(OrganizationAccessTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationAccessTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationAccessTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: OrganizationAccessTokenPropSnake.creator_id, referencedColumnName: UserPropCamel.userId })
  creator?: User;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: OrganizationAccessTokenPropSnake.revoker_id, referencedColumnName: UserPropCamel.userId })
  revoker?: User;

  @Exclude()
  @ManyToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: TokenPropSnake.token_id, referencedColumnName: TokenPropCamel.tokenId })
  token!: Token;

  @OneToOne(() => Organization, { createForeignKeyConstraints: false })
  @JoinColumn({
    name: OrganizationAccessTokenPropSnake.organization_id, //
    referencedColumnName: OrganizationAccessTokenPropCamel.organizationId,
  })
  organization?: Organization;
}
