import {
  ProjectAndTeamAndProjectRolePropCamel,
  ProjectAndTeamAndProjectRolePropSnake,
  ProjectAndUserAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropSnake,
  ProjectBase,
  ProjectPropSnake,
} from '@dogu-private/console';
import {
  OrganizationId,
  ProjectId,
  PROJECT_AND_TEAM_AND_PROJECT_ROLE_TABLE_NAME,
  PROJECT_AND_USER_AND_PROJECT_ROLE_TABLE_NAME,
  PROJECT_DESC_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_TABLE_NAME,
  UserId,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { ProjectAndDevice, ProjectAndTeamAndProjectRole, ProjectAndUserAndProjectRole } from './index';
import { Organization } from './organization.entity';
import { RoutinePipeline } from './pipeline.entity';
import { ProjectScm } from './project-scm.entity';
import { ProjectSlackRemote } from './project-slack-remote.entity';
import { ProjectSlackRoutine } from './project-slack-routine.entity';
import { Routine } from './routine.entity';
import { Team } from './team.entity';
import { Member } from './type/type';
import { User } from './user.entity';

@Entity(PROJECT_TABLE_NAME)
export class Project extends BaseEntity implements ProjectBase {
  @PrimaryGeneratedColumn('uuid', { name: ProjectPropSnake.project_id })
  projectId!: ProjectId;

  @Column({ type: 'character varying', name: ProjectPropSnake.name, length: PROJECT_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'character varying', name: ProjectPropSnake.description, length: PROJECT_DESC_MAX_LENGTH, nullable: false })
  description!: string;

  @ColumnTemplate.RelationUuid(ProjectPropSnake.managed_by)
  managedBy!: UserId;

  @ColumnTemplate.RelationUuid(ProjectPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.CreateDate(ProjectPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(ProjectPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(ProjectPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Organization, (organization) => organization.projects, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: ProjectPropSnake.organization_id })
  organization!: Organization;

  @ManyToMany(() => User, (user) => user.projects, { createForeignKeyConstraints: false })
  @JoinTable({
    name: PROJECT_AND_USER_AND_PROJECT_ROLE_TABLE_NAME,
    inverseJoinColumn: {
      name: ProjectAndUserAndProjectRolePropSnake.user_id,
      referencedColumnName: ProjectAndUserAndProjectRolePropCamel.userId,
    },
    joinColumn: {
      name: ProjectAndUserAndProjectRolePropSnake.project_id,
      referencedColumnName: ProjectAndUserAndProjectRolePropCamel.projectId,
    },
  })
  users?: User[];

  @ManyToMany(() => Team, (team) => team.projects, { createForeignKeyConstraints: false })
  @JoinTable({
    name: PROJECT_AND_TEAM_AND_PROJECT_ROLE_TABLE_NAME,
    inverseJoinColumn: {
      name: ProjectAndTeamAndProjectRolePropSnake.team_id,
      referencedColumnName: ProjectAndTeamAndProjectRolePropCamel.teamId,
    },
    joinColumn: {
      name: ProjectAndTeamAndProjectRolePropSnake.project_id,
      referencedColumnName: ProjectAndTeamAndProjectRolePropCamel.projectId,
    },
  })
  teams?: Team[];

  members?: Member[];

  @ManyToMany(() => Device, (device) => device.projects, { createForeignKeyConstraints: false })
  devices?: Device[];

  @OneToMany(() => ProjectAndDevice, (deviceAndProject) => deviceAndProject.project, { cascade: ['soft-remove'] })
  projectAndDevices?: ProjectAndDevice[];

  @OneToMany(() => RoutinePipeline, (pipeline) => pipeline.project, { cascade: ['soft-remove'] })
  routinePipelines?: RoutinePipeline[];

  @OneToMany(() => Routine, (routine) => routine.project, { cascade: ['soft-remove'] })
  routines?: Routine[];

  @OneToMany(() => ProjectAndTeamAndProjectRole, (projectTeamRole) => projectTeamRole.project, { cascade: ['soft-remove'] })
  projectAndTeamAndProjectRoles?: ProjectAndTeamAndProjectRole[];

  @OneToMany(() => ProjectAndUserAndProjectRole, (projectUserRole) => projectUserRole.project, { cascade: ['soft-remove'] })
  projectAndUserAndProjectRoles?: ProjectAndUserAndProjectRole[];

  @OneToMany(() => ProjectScm, (projectScm) => projectScm.project, { cascade: ['soft-remove'] })
  projectScms?: ProjectScm[];

  @OneToMany(() => ProjectSlackRemote, (remoteSlack) => remoteSlack.project, { cascade: ['soft-remove'] })
  projectSlackRemote?: ProjectSlackRemote[];

  @OneToMany(() => ProjectSlackRoutine, (routineSlack) => routineSlack.project, { cascade: ['soft-remove'] })
  projectSlackRoutine?: ProjectSlackRoutine[];
}
