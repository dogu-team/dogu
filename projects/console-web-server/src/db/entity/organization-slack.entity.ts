import { OrganizationPropCamel } from '@dogu-private/console';
import { OrganizationSlackBase, OrganizationSlackPropSnake } from '@dogu-private/console/src/base/organization-slack';
import { OrganizationId, SLACK_TABLE_NAME } from '@dogu-private/types';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './decorators';
import { Organization } from './organization.entity';

@Entity(SLACK_TABLE_NAME)
export class OrganizationSlack extends BaseEntity implements OrganizationSlackBase {
  @PrimaryColumn({ type: 'uuid', name: OrganizationSlackPropSnake.organization_id })
  organizationId!: OrganizationId;

  @Column({ type: 'character varying', name: OrganizationSlackPropSnake.authed_user_id, nullable: false })
  authedUserId!: string;

  @Column({ type: 'character varying', name: OrganizationSlackPropSnake.scope, nullable: false })
  scope!: string;

  @Column({ type: 'character varying', name: OrganizationSlackPropSnake.access_token, nullable: false })
  accessToken!: string;

  @Column({ type: 'character varying', name: OrganizationSlackPropSnake.bot_user_id, nullable: false })
  botUserId!: string;

  @Column({ type: 'character varying', name: OrganizationSlackPropSnake.team_id, nullable: false })
  teamId!: string;

  @Column({ type: 'character varying', name: OrganizationSlackPropSnake.team_name, nullable: false })
  teamName!: string;

  @ColumnTemplate.CreateDate(OrganizationSlackPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(OrganizationSlackPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(OrganizationSlackPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => Organization, (organization) => organization.organizationSlack, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({
    name: OrganizationSlackPropSnake.organization_id, //
    referencedColumnName: OrganizationPropCamel.organizationId,
  })
  organization?: Organization;
}
