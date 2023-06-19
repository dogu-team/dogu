import { ProjectRoleBase, ProjectRolePropCamel, ProjectRolePropSnake } from '@dogu-private/console';
import { OrganizationId, ProjectRoleId, PROJECT_ROLE_NAME_MAX_LENGTH, PROJECT_ROLE_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization, ProjectAndTeamAndProjectRole } from './index';

import { ProjectAndUserAndProjectRole } from './relations/project-and-user-and-project-role.entity';

@Entity(PROJECT_ROLE_TABLE_NAME)
export class ProjectRole extends BaseEntity implements ProjectRoleBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: ProjectRolePropSnake.project_role_id, unsigned: true })
  projectRoleId!: ProjectRoleId;

  @Column({ type: 'character varying', name: 'name', length: PROJECT_ROLE_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @ColumnTemplate.RelationUuid(ProjectRolePropSnake.organization_id, true)
  organizationId!: OrganizationId | null;

  @Column({ type: 'smallint', name: ProjectRolePropSnake.customise, unsigned: true, default: 0, nullable: false })
  customise!: number;

  @ColumnTemplate.CreateDate(ProjectRolePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectRolePropSnake.updated_at)
  updatedAt!: Date;

  @OneToMany(() => ProjectAndUserAndProjectRole, (projectUserRole) => projectUserRole.projectRole)
  projectAndUserAndProjectRoles?: ProjectAndUserAndProjectRole[];

  @OneToMany(() => ProjectAndTeamAndProjectRole, (projectTeamRole) => projectTeamRole.projectRole)
  projectAndTeamAndProjectRoles?: ProjectAndTeamAndProjectRole[];

  @ManyToOne(() => Organization, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: ProjectRolePropSnake.organization_id,
    referencedColumnName: ProjectRolePropCamel.organizationId,
  })
  organization?: Organization;
}
