import { ProjectAndTeamAndProjectRoleBase, ProjectAndTeamAndProjectRolePropSnake } from '@dogu-private/console';
import { ProjectId, ProjectRoleId, PROJECT_AND_TEAM_AND_PROJECT_ROLE_TABLE_NAME, TeamId } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { ProjectRole } from '../project-role.entity';
import { Project } from '../project.entity';
import { Team } from '../team.entity';

@Entity(PROJECT_AND_TEAM_AND_PROJECT_ROLE_TABLE_NAME)
export class ProjectAndTeamAndProjectRole extends BaseEntity implements ProjectAndTeamAndProjectRoleBase {
  @PrimaryColumn({ type: 'int', name: ProjectAndTeamAndProjectRolePropSnake.team_id, unsigned: true, nullable: false })
  teamId!: TeamId;

  @PrimaryColumn({ type: 'uuid', name: ProjectAndTeamAndProjectRolePropSnake.project_id, nullable: false })
  projectId!: ProjectId;

  @Column({ type: 'int', name: ProjectAndTeamAndProjectRolePropSnake.project_role_id, unsigned: true, nullable: false })
  projectRoleId!: ProjectRoleId;

  @ColumnTemplate.CreateDate(ProjectAndTeamAndProjectRolePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectAndTeamAndProjectRolePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectAndTeamAndProjectRolePropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Team, (team) => team.projectAndTeamAndProjectRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndTeamAndProjectRolePropSnake.team_id })
  team?: Team;

  @ManyToOne(() => Project, (project) => project.projectAndTeamAndProjectRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndTeamAndProjectRolePropSnake.project_id })
  project?: Project;

  @ManyToOne(() => ProjectRole, (projectRole) => projectRole.projectAndTeamAndProjectRoles, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectAndTeamAndProjectRolePropSnake.project_role_id })
  projectRole?: ProjectRole;
}
