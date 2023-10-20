import { LicenseSelfHostedTierBase, LicenseSelfHostedTierId, LicenseSelfHostedTierPropSnake, LICENSE_SELF_HOSTED_TIER_TABLE_NAME } from '@dogu-private/console';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { License } from './license.enitiy';
import { ColumnTemplate } from './util/decorators';

@Entity(LICENSE_SELF_HOSTED_TIER_TABLE_NAME)
export class LicenseSelfHostedTier extends BaseEntity implements LicenseSelfHostedTierBase {
  @PrimaryGeneratedColumn('increment', { type: 'int', name: LicenseSelfHostedTierPropSnake.license_self_hosted_tier_id, unsigned: true })
  licenseSelfHostedTierId!: LicenseSelfHostedTierId;

  @Column({ type: 'character varying', name: LicenseSelfHostedTierPropSnake.name, nullable: false })
  name!: string;

  @Column({ type: 'integer', name: LicenseSelfHostedTierPropSnake.enabled_mobile_count, nullable: false })
  enabledMobileCount!: number;

  @Column({ type: 'integer', name: LicenseSelfHostedTierPropSnake.enabled_browser_count, nullable: false })
  enabledBrowserCount!: number;

  @Column({ type: 'boolean', name: LicenseSelfHostedTierPropSnake.open_api_enabled, nullable: false })
  openApiEnabled!: boolean;

  @Column({ type: 'boolean', name: LicenseSelfHostedTierPropSnake.dogu_agent_auto_update_enabled, nullable: false })
  doguAgentAutoUpdateEnabled!: boolean;

  @ColumnTemplate.CreateDate(LicenseSelfHostedTierPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.DeleteDate(LicenseSelfHostedTierPropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => License, (license) => license.licenseTier, { cascade: ['soft-remove'] })
  license?: License;
}
