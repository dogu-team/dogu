import { OrganizationUserAndTeamBase, OrganizationUserAndTeamPropSnake } from '@dogu-private/console';
import { OrganizationId, ORGANIZATION_AND_USER_AND_TEAM, TeamId, UserId } from '@dogu-private/types';
import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from '../decorators';
import { Organization } from '../organization.entity';
import { Team } from '../team.entity';
import { User } from '../user.entity';

@Entity(ORGANIZATION_AND_USER_AND_TEAM)
export class OrganizationAndUserAndTeam extends BaseEntity implements OrganizationUserAndTeamBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationUserAndTeamPropSnake.user_id, nullable: false })
  userId!: UserId;

  @PrimaryColumn({ type: 'int', name: OrganizationUserAndTeamPropSnake.team_id, unsigned: true, nullable: false })
  teamId!: TeamId;

  @ColumnTemplate.RelationUuid(OrganizationUserAndTeamPropSnake.organization_id)
  organizationId!: OrganizationId;

  @ColumnTemplate.CreateDate(OrganizationUserAndTeamPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationUserAndTeamPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.organizationAndUserAndTeams, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationUserAndTeamPropSnake.user_id })
  user?: User;

  @ManyToOne(() => Team, (team) => team.organizationAndUserAndTeams, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationUserAndTeamPropSnake.team_id })
  team?: Team;

  @ManyToOne(() => Organization, (organization) => organization.organizationAndUserAndTeams, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: OrganizationUserAndTeamPropSnake.organization_id })
  organization?: Organization;
}
