import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { OrganizationRoleBase, OrganizationRolePropSnake } from '@dogu-private/console';
import { OrganizationId, OrganizationRoleId, ORGANIZATION_ROLE_NAME_MAX_LENGTH, ORGANIZATION_ROLE_TABLE_NAME } from '@dogu-private/types';
import { ColumnTemplate } from './decorators';
import { OrganizationAndUserAndOrganizationRole } from './index';

@Entity(ORGANIZATION_ROLE_TABLE_NAME)
export class OrganizationRole extends BaseEntity implements OrganizationRoleBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: OrganizationRolePropSnake.organization_role_id, unsigned: true })
  organizationRoleId!: OrganizationRoleId;

  @ColumnTemplate.RelationUuid(OrganizationRolePropSnake.organization_id, true)
  organizationId!: OrganizationId | null;

  @Column({ type: 'character varying', name: OrganizationRolePropSnake.name, length: ORGANIZATION_ROLE_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'smallint', name: OrganizationRolePropSnake.customise, unsigned: true, default: 0, nullable: false })
  customise!: number;

  @ColumnTemplate.CreateDate(OrganizationRolePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationRolePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationRolePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => OrganizationAndUserAndOrganizationRole, (orgUserRole) => orgUserRole.organizationRole, { createForeignKeyConstraints: false })
  organizationAndUserAndOrganizationRoles?: OrganizationAndUserAndOrganizationRole[];
}
