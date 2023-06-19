import { UserAndInvitationTokenBase, UserAndInvitationTokenPropCamel, UserAndInvitationTokenPropSnake } from '@dogu-private/console';
import { OrganizationId, OrganizationRoleId, TokenId, UserId, USER_AND_INVITATION_TOKEN_TABLE_NAME, USER_EMAIL_MAX_LENGTH, USER_INVITATION_STATUS } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { OrganizationRole } from '../organization-role.entity';
import { Organization } from '../organization.entity';
import { Token } from '../token.entity';

@Entity(USER_AND_INVITATION_TOKEN_TABLE_NAME)
export class UserAndInvitationToken extends BaseEntity implements UserAndInvitationTokenBase {
  @PrimaryColumn({ type: 'character varying', name: UserAndInvitationTokenPropSnake.email, length: USER_EMAIL_MAX_LENGTH, unique: true, nullable: false })
  email!: string;

  @PrimaryColumn({ type: 'uuid', name: UserAndInvitationTokenPropSnake.organization_id, nullable: false })
  organizationId!: OrganizationId;

  @Column({ type: 'int', name: UserAndInvitationTokenPropSnake.organization_role_id, unsigned: true, nullable: false })
  organizationRoleId!: OrganizationRoleId;

  @ColumnTemplate.RelationUuid(UserAndInvitationTokenPropSnake.token_id, true)
  tokenId!: TokenId;

  @Column({ type: 'enum', name: UserAndInvitationTokenPropSnake.status, enum: USER_INVITATION_STATUS, default: USER_INVITATION_STATUS.PENDING, nullable: false })
  status!: USER_INVITATION_STATUS;

  @ColumnTemplate.RelationUuid(UserAndInvitationTokenPropSnake.inviter_id)
  inviterId!: UserId;

  @ColumnTemplate.CreateDate(UserAndInvitationTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(UserAndInvitationTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(UserAndInvitationTokenPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => Token, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION', cascade: ['soft-remove'] })
  @JoinColumn({ name: UserAndInvitationTokenPropSnake.token_id, referencedColumnName: UserAndInvitationTokenPropCamel.tokenId })
  token!: Token;

  @ManyToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserAndInvitationTokenPropSnake.organization_id, referencedColumnName: UserAndInvitationTokenPropCamel.organizationId })
  organization!: Organization;

  @ManyToOne(() => OrganizationRole, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: UserAndInvitationTokenPropSnake.organization_role_id, referencedColumnName: UserAndInvitationTokenPropCamel.organizationRoleId })
  organizationRole!: OrganizationRole;
}
