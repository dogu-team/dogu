import {
  OrganizationAndUserAndOrganizationRoleBase,
  OrganizationAndUserAndOrganizationRolePropCamel,
  OrganizationAndUserAndOrganizationRolePropSnake,
} from '@dogu-private/console';
import { OrganizationId, OrganizationRoleId, ORGANIZATION_AND_USER_AND_ORGANIZATION_ROLE_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { OrganizationRole } from '../organization-role.entity';
import { Organization } from '../organization.entity';
import { User } from '../user.entity';

@Entity(ORGANIZATION_AND_USER_AND_ORGANIZATION_ROLE_TABLE_NAME)
export class OrganizationAndUserAndOrganizationRole extends BaseEntity implements OrganizationAndUserAndOrganizationRoleBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationAndUserAndOrganizationRolePropSnake.organization_id, nullable: false })
  organizationId!: OrganizationId;

  @PrimaryColumn({ type: 'uuid', name: OrganizationAndUserAndOrganizationRolePropSnake.user_id, nullable: false })
  userId!: UserId;

  @Column({ type: 'int', name: OrganizationAndUserAndOrganizationRolePropSnake.organization_role_id, unsigned: true, nullable: false })
  organizationRoleId!: OrganizationRoleId;

  @ColumnTemplate.CreateDate(OrganizationAndUserAndOrganizationRolePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationAndUserAndOrganizationRolePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationAndUserAndOrganizationRolePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.organizationAndUserAndOrganizationRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationAndUserAndOrganizationRolePropSnake.user_id, referencedColumnName: OrganizationAndUserAndOrganizationRolePropCamel.userId })
  user?: User;

  @ManyToOne(() => OrganizationRole, (organizationRole) => organizationRole.organizationAndUserAndOrganizationRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationAndUserAndOrganizationRolePropSnake.organization_role_id })
  organizationRole?: OrganizationRole;

  @ManyToOne(() => Organization, (organization) => organization.organizationAndUserAndOrganizationRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: OrganizationAndUserAndOrganizationRolePropSnake.organization_id, //
    referencedColumnName: OrganizationAndUserAndOrganizationRolePropCamel.organizationId,
  })
  organization?: Organization;
}
