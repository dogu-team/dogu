import { ProjectAndUserAndProjectRoleBase, ProjectAndUserAndProjectRolePropSnake } from '@dogu-private/console';
import { ProjectId, ProjectRoleId, PROJECT_AND_USER_AND_PROJECT_ROLE_TABLE_NAME, UserId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { ProjectRole } from '../project-role.entity';
import { Project } from '../project.entity';

import { User } from '../user.entity';

@Entity(PROJECT_AND_USER_AND_PROJECT_ROLE_TABLE_NAME)
export class ProjectAndUserAndProjectRole extends BaseEntity implements ProjectAndUserAndProjectRoleBase {
  @PrimaryColumn({ type: 'uuid', name: ProjectAndUserAndProjectRolePropSnake.user_id, nullable: false })
  userId!: UserId;

  @Column({ type: 'int', name: ProjectAndUserAndProjectRolePropSnake.project_role_id, unsigned: true, nullable: false })
  projectRoleId!: ProjectRoleId;

  @PrimaryColumn({ type: 'uuid', name: ProjectAndUserAndProjectRolePropSnake.project_id, nullable: false })
  projectId!: ProjectId;

  @ColumnTemplate.CreateDate(ProjectAndUserAndProjectRolePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectAndUserAndProjectRolePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectAndUserAndProjectRolePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.projectAndUserAndProjectRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndUserAndProjectRolePropSnake.user_id })
  user?: User;

  @ManyToOne(() => Project, (project) => project.projectAndUserAndProjectRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndUserAndProjectRolePropSnake.project_id })
  project?: Project;

  @ManyToOne(() => ProjectRole, (projectRole) => projectRole.projectAndUserAndProjectRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndUserAndProjectRolePropSnake.project_role_id })
  projectRole?: ProjectRole;
}
