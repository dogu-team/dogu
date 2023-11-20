import {
  ChangeLogUserReactionTraitsBase,
  OrganizationAndUserAndOrganizationRolePropCamel,
  OrganizationAndUserAndOrganizationRolePropSnake,
  OrganizationUserAndTeamPropCamel,
  OrganizationUserAndTeamPropSnake,
  ProjectAndUserAndProjectRolePropCamel,
  ProjectAndUserAndProjectRolePropSnake,
  UserBase,
  UserPropCamel,
  UserPropSnake,
} from '@dogu-private/console';
import {
  ORGANIZATION_AND_USER_AND_ORGANIZATION_ROLE_TABLE_NAME,
  ORGANIZATION_AND_USER_AND_TEAM,
  PROJECT_AND_USER_AND_PROJECT_ROLE_TABLE_NAME,
  UserId,
  USER_EMAIL_MAX_LENGTH,
  USER_HASHED_PASSWORD_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_PROFILE_IMAGE_URL_MAX_LENGTH,
} from '@dogu-private/types';
import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import {
  ChangeLogUserReaction,
  Host,
  Organization,
  OrganizationAndUserAndOrganizationRole,
  OrganizationAndUserAndTeam,
  Project,
  ProjectAndUserAndProjectRole,
  RoutinePipeline,
  Team,
  UserAndRefreshToken,
} from './index';
import { ProjectApplication } from './project-application.entity';
import { UserAndInvitationToken } from './relations/user-and-invitation-token.entity';
import { UserAndResetPasswordToken } from './relations/user-and-reset-password-token.entity';
import { UserAndVerificationToken } from './relations/user-and-verification-token.entity';
import { TestExecutor } from './test-executor.entity';
import { UserEmailPreference } from './user-email-preference.entity';
import { UserSns } from './user-sns.entity';

@Entity('user')
export class User extends BaseEntity implements UserBase {
  @PrimaryGeneratedColumn('uuid', { name: UserPropSnake.user_id })
  userId!: UserId;

  @Column({ type: 'character varying', name: UserPropSnake.email, length: USER_EMAIL_MAX_LENGTH, unique: true, nullable: false })
  email!: string;

  @Column({ type: 'character varying', name: UserPropSnake.unique_email, length: USER_EMAIL_MAX_LENGTH, unique: true })
  uniqueEmail!: string;

  @Exclude()
  @Column({ type: 'character varying', name: UserPropSnake.password, length: USER_HASHED_PASSWORD_MAX_LENGTH, nullable: true })
  password!: string | null;

  @Column({ type: 'character varying', name: UserPropSnake.name, length: USER_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'character varying', name: UserPropSnake.profile_image_url, length: USER_PROFILE_IMAGE_URL_MAX_LENGTH, nullable: true })
  profileImageUrl!: string | null;

  @Column({ type: 'smallint', name: UserPropSnake.is_tutorial_completed, nullable: false, default: 0 })
  isTutorialCompleted!: number;

  @Column({ type: 'timestamptz', name: UserPropSnake.last_change_log_seen_at, precision: 3, nullable: true })
  lastChangeLogSeenAt!: Date | null;

  @Column({ type: 'boolean', name: UserPropSnake.is_root, nullable: false, default: false })
  isRoot!: boolean;

  @ColumnTemplate.Date(UserPropSnake.last_accessed_at, true)
  lastAccessedAt!: Date;

  @ColumnTemplate.CreateDate(UserPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(UserPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(UserPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToMany(() => Organization, { createForeignKeyConstraints: false })
  @JoinTable({
    name: ORGANIZATION_AND_USER_AND_ORGANIZATION_ROLE_TABLE_NAME,
    inverseJoinColumn: {
      name: OrganizationAndUserAndOrganizationRolePropSnake.organization_id,
      referencedColumnName: OrganizationAndUserAndOrganizationRolePropCamel.organizationId,
    },
    joinColumn: {
      name: OrganizationAndUserAndOrganizationRolePropSnake.user_id,
      referencedColumnName: OrganizationAndUserAndOrganizationRolePropCamel.userId,
    },
  })
  organizations?: Organization[];

  @ManyToMany(() => Project, { createForeignKeyConstraints: false })
  @JoinTable({
    name: PROJECT_AND_USER_AND_PROJECT_ROLE_TABLE_NAME,
    inverseJoinColumn: {
      name: ProjectAndUserAndProjectRolePropSnake.project_id,
      referencedColumnName: ProjectAndUserAndProjectRolePropCamel.projectId,
    },
    joinColumn: {
      name: ProjectAndUserAndProjectRolePropSnake.user_id,
      referencedColumnName: ProjectAndUserAndProjectRolePropCamel.userId,
    },
  })
  projects?: Project[];

  @ManyToMany(() => Team, { createForeignKeyConstraints: false })
  @JoinTable({
    name: ORGANIZATION_AND_USER_AND_TEAM,
    inverseJoinColumn: {
      name: OrganizationUserAndTeamPropSnake.team_id,
      referencedColumnName: OrganizationUserAndTeamPropCamel.teamId,
    },
    joinColumn: {
      name: OrganizationUserAndTeamPropSnake.user_id,
      referencedColumnName: OrganizationUserAndTeamPropCamel.userId,
    },
  })
  teams?: Team[];

  @OneToMany(
    () => OrganizationAndUserAndOrganizationRole, //
    (organizationAndUserAndOrganizationRole) => organizationAndUserAndOrganizationRole.user,
    { cascade: ['soft-remove'] },
  )
  organizationAndUserAndOrganizationRoles?: OrganizationAndUserAndOrganizationRole[];

  @OneToMany(() => RoutinePipeline, (pipeline) => pipeline.creator)
  routinePipelines?: RoutinePipeline[];

  @OneToMany(() => Host, (host) => host.creator)
  hosts?: Host[];

  @OneToMany(() => OrganizationAndUserAndTeam, (userAndTeam) => userAndTeam.user, { cascade: ['soft-remove'] })
  organizationAndUserAndTeams?: OrganizationAndUserAndTeam[];

  @OneToMany(() => ProjectAndUserAndProjectRole, (userAndRoleGroup) => userAndRoleGroup.user, { cascade: ['soft-remove'] })
  projectAndUserAndProjectRoles?: ProjectAndUserAndProjectRole[];

  @OneToMany(() => UserAndRefreshToken, (userAndRefreshToken) => userAndRefreshToken.user, { cascade: ['soft-remove'] })
  userAndRefreshTokens?: UserAndRefreshToken[];

  @OneToOne(() => UserSns, { cascade: ['soft-remove'], createForeignKeyConstraints: false })
  @JoinColumn({
    name: UserPropSnake.user_id,
    referencedColumnName: UserPropCamel.userId,
  })
  userSns?: UserSns;

  @OneToOne(() => UserAndVerificationToken, (verification) => verification.user, { cascade: ['soft-remove'], createForeignKeyConstraints: false })
  @JoinColumn({
    name: UserPropSnake.user_id,
    referencedColumnName: UserPropCamel.userId,
  })
  userAndVerificationToken?: UserAndVerificationToken;

  @OneToOne(() => UserAndInvitationToken, { cascade: ['soft-remove'], createForeignKeyConstraints: false })
  @JoinColumn({
    name: UserPropSnake.email,
    referencedColumnName: UserPropCamel.email,
  })
  userAndInvitationToken?: UserAndInvitationToken;

  @OneToOne(() => UserAndResetPasswordToken, (resetPassword) => resetPassword.user, { cascade: ['soft-remove'], createForeignKeyConstraints: false })
  @JoinColumn({
    name: UserPropSnake.user_id,
    referencedColumnName: UserPropCamel.userId,
  })
  userAndResetPasswordToken?: UserAndResetPasswordToken;

  @OneToOne(() => UserEmailPreference, { cascade: ['soft-remove'], createForeignKeyConstraints: false })
  @JoinColumn({
    name: UserPropSnake.user_id,
    referencedColumnName: UserPropCamel.userId,
  })
  emailPreference?: UserEmailPreference;

  projectApplications?: ProjectApplication[];

  @OneToMany(() => ChangeLogUserReaction, (reaction) => reaction.user, { cascade: ['soft-remove'] })
  changeLogReactions?: ChangeLogUserReactionTraitsBase[];

  @OneToMany(() => TestExecutor, (executor) => executor.creator)
  testExecutors?: TestExecutor[];
}
