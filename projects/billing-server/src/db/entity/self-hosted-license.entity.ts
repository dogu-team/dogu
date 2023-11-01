import { SelfHostedLicenseBase, SelfHostedLicensePropCamel, SelfHostedLicensePropSnake } from '@dogu-private/console';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { BillingOrganization } from './billing-organization.entity';

import { ColumnTemplate } from './util/decorators';

@Entity('self_hosted_license')
export class SelfHostedLicense implements SelfHostedLicenseBase {
  @PrimaryColumn('uuid', { name: SelfHostedLicensePropSnake.self_hosted_license_id })
  selfHostedLicenseId!: string;

  @Column({ type: 'character varying', name: SelfHostedLicensePropSnake.license_key })
  licenseKey!: string;

  /**
   * @deprecated use organizationId instead
   */
  @Column({ type: 'character varying', name: SelfHostedLicensePropSnake.company_name, nullable: true })
  companyName!: string | null;

  @Column({ type: 'character varying', name: SelfHostedLicensePropSnake.organization_id, nullable: true, unique: true })
  organizationId!: string | null;

  @Column({ type: 'integer', name: SelfHostedLicensePropSnake.maximum_enabled_mobile_count, default: 2 })
  maximumEnabledMobileCount!: number;

  @Column({ type: 'integer', name: SelfHostedLicensePropSnake.maximum_enabled_browser_count, default: 2 })
  maximumEnabledBrowserCount!: number;

  @Column({ type: 'boolean', name: SelfHostedLicensePropSnake.open_api_enabled, default: false })
  openApiEnabled!: boolean;

  @Column({ type: 'boolean', name: SelfHostedLicensePropSnake.dogu_agent_auto_update_enabled, default: false })
  doguAgentAutoUpdateEnabled!: boolean;

  @ColumnTemplate.CreateDate(SelfHostedLicensePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.CreateDate(SelfHostedLicensePropSnake.last_access_at)
  lastAccessAt!: Date;

  @ColumnTemplate.UpdateDate(SelfHostedLicensePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(SelfHostedLicensePropSnake.expired_at, false)
  expiredAt!: Date;

  @ColumnTemplate.DeleteDate(SelfHostedLicensePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToOne(() => BillingOrganization, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: SelfHostedLicensePropSnake.organization_id, referencedColumnName: SelfHostedLicensePropCamel.organizationId })
  billingOrganization?: BillingOrganization | null;
}
