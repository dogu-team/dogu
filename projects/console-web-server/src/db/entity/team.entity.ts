import {
  OrganizationPropSnake,
  ProjectAndTeamAndProjectRolePropCamel,
  ProjectAndTeamAndProjectRolePropSnake,
  TeamBase,
  TeamPropCamel,
  TeamPropSnake,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import { OrganizationId, ORGANIZATION_AND_USER_AND_TEAM, PROJECT_AND_TEAM_AND_PROJECT_ROLE_TABLE_NAME, TeamId, TEAM_NAME_MAX_LENGTH, TEAM_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Organization, OrganizationAndUserAndTeam, ProjectAndTeamAndProjectRole } from './index';
import { Project } from './project.entity';
import { User } from './user.entity';

@Entity(TEAM_TABLE_NAME)
export class Team extends BaseEntity implements TeamBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: TeamPropSnake.team_id, unsigned: true })
  teamId!: TeamId;

  @Column({ type: 'character varying', name: TeamPropSnake.name, length: TEAM_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @ColumnTemplate.RelationUuid(OrganizationPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.CreateDate(TeamPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(TeamPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(UserPropSnake.deleted_at)
  deletedAt!: Date | null;

  // relations
  @ManyToMany(() => User, { createForeignKeyConstraints: false })
  @JoinTable({
    name: ORGANIZATION_AND_USER_AND_TEAM,
    inverseJoinColumn: {
      name: UserPropSnake.user_id,
      referencedColumnName: UserPropCamel.userId,
    },
    joinColumn: {
      name: TeamPropSnake.team_id,
      referencedColumnName: TeamPropCamel.teamId,
    },
  })
  users?: User[];

  @OneToMany(() => OrganizationAndUserAndTeam, (userAndTeam) => userAndTeam.team, { cascade: ['soft-remove'] })
  organizationAndUserAndTeams?: OrganizationAndUserAndTeam[];

  @ManyToMany(() => Project, { createForeignKeyConstraints: false })
  @JoinTable({
    name: PROJECT_AND_TEAM_AND_PROJECT_ROLE_TABLE_NAME,
    inverseJoinColumn: {
      name: ProjectAndTeamAndProjectRolePropSnake.project_id,
      referencedColumnName: ProjectAndTeamAndProjectRolePropCamel.projectId,
    },
    joinColumn: {
      name: ProjectAndTeamAndProjectRolePropSnake.team_id,
      referencedColumnName: ProjectAndTeamAndProjectRolePropCamel.teamId,
    },
  })
  projects?: Project[];

  @OneToMany(() => ProjectAndTeamAndProjectRole, (projectAndTeamAndProjectRoles) => projectAndTeamAndProjectRoles.team, { cascade: ['soft-remove'] })
  projectAndTeamAndProjectRoles?: ProjectAndTeamAndProjectRole[];

  @ManyToOne(() => Organization, (organization) => organization.teams, { createForeignKeyConstraints: false })
  @JoinColumn({ name: OrganizationPropSnake.organization_id })
  organization!: Organization;
}
