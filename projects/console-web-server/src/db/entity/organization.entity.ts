import { OrganizationBase, OrganizationPropCamel, OrganizationPropSnake, UserPropCamel, UserPropSnake } from '@dogu-private/console';
import {
  OrganizationId,
  ORGANIZATION_AND_USER_AND_ORGANIZATION_ROLE_TABLE_NAME,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_TABLE_NAME,
  USER_PROFILE_IMAGE_URL_MAX_LENGTH,
} from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnTemplate } from './decorators';
import { Device } from './device.entity';
import { Host } from './host.entity';
import { DeviceTag, OrganizationAndUserAndOrganizationRole, OrganizationAndUserAndTeam, Team, User } from './index';
import { LiveSession } from './live-session.entity';
import { OrganizationSlack } from './organization-slack.entity';
import { Project } from './project.entity';
import { UserAndInvitationToken } from './relations/user-and-invitation-token.entity';

@Entity(ORGANIZATION_TABLE_NAME)
export class Organization extends BaseEntity implements OrganizationBase {
  @PrimaryGeneratedColumn('uuid', { name: OrganizationPropSnake.organization_id })
  organizationId!: OrganizationId;

  @Column({ type: 'character varying', name: OrganizationPropSnake.name, length: ORGANIZATION_NAME_MAX_LENGTH, nullable: false })
  name!: string;

  @Column({ type: 'character varying', name: OrganizationPropSnake.profile_image_url, length: USER_PROFILE_IMAGE_URL_MAX_LENGTH, default: null, nullable: true })
  profileImageUrl!: string;

  @Column({ type: 'boolean', name: OrganizationPropSnake.shareable, default: false, nullable: false })
  shareable!: boolean;

  @ColumnTemplate.CreateDate(OrganizationPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => Device, (device) => device.organization, { cascade: ['soft-remove'] })
  devices?: Device[];

  @OneToMany(() => DeviceTag, (tag) => tag.organization, { cascade: ['soft-remove'] })
  deviceTags?: DeviceTag[];

  @OneToMany(() => Host, (host) => host.organization, { cascade: ['soft-remove'] })
  hosts?: Host[];

  @OneToMany(() => Project, (project) => project.organization, { cascade: ['soft-remove'] })
  projects?: Project[];

  @OneToMany(
    () => OrganizationAndUserAndOrganizationRole, //
    (organizationAndUserAndOrganizationRole) => organizationAndUserAndOrganizationRole.organization,
    { cascade: ['soft-remove'] },
  )
  organizationAndUserAndOrganizationRoles?: OrganizationAndUserAndOrganizationRole[];

  @OneToMany(() => Team, (team) => team.organization, { cascade: ['soft-remove'] })
  teams?: Team[];

  @OneToMany(() => OrganizationAndUserAndTeam, (userAndTeam) => userAndTeam.organization, { cascade: ['soft-remove'] })
  organizationAndUserAndTeams?: OrganizationAndUserAndTeam[];

  @ManyToMany(() => User, { createForeignKeyConstraints: false })
  @JoinTable({
    name: ORGANIZATION_AND_USER_AND_ORGANIZATION_ROLE_TABLE_NAME,
    inverseJoinColumn: {
      name: UserPropSnake.user_id,
      referencedColumnName: UserPropCamel.userId,
    },
    joinColumn: {
      name: OrganizationPropSnake.organization_id,
      referencedColumnName: OrganizationPropCamel.organizationId,
    },
  })
  users?: User[];

  @OneToMany(() => UserAndInvitationToken, (invitation) => invitation.organization, { cascade: ['soft-remove'] })
  userInvitations?: UserAndInvitationToken[];

  @OneToMany(() => OrganizationSlack, (slack) => slack.organization, { cascade: ['soft-remove'] })
  organizationSlack?: OrganizationSlack[];

  @OneToMany(() => LiveSession, (liveSession) => liveSession.organization, { cascade: ['soft-remove'] })
  liveSessions?: LiveSession[];
}
