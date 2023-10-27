import { SelfHostedLicenseBase, SelfHostedLicenseTokenPropSnake } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ColumnTemplate } from './util/decorators';

@Entity('self_hosted_license')
export class SelfHostedLicense implements SelfHostedLicenseBase {
  @PrimaryColumn('uuid', { name: SelfHostedLicenseTokenPropSnake.self_hosted_license_id })
  selfHostedLicenseId!: string;

  @Column({ type: 'character varying', name: SelfHostedLicenseTokenPropSnake.license_key })
  licenseKey!: string;

  /**
   * @deprecated use organizationId instead
   */
  @Column({ type: 'character varying', name: SelfHostedLicenseTokenPropSnake.company_name, nullable: true })
  companyName!: string | null;

  @Column({ type: 'character varying', name: SelfHostedLicenseTokenPropSnake.organization_id, nullable: true })
  organizationId!: string | null;

  @Column({ type: 'integer', name: SelfHostedLicenseTokenPropSnake.maximum_enabled_mobile_count, default: 2 })
  maximumEnabledMobileCount!: number;

  @Column({ type: 'integer', name: SelfHostedLicenseTokenPropSnake.maximum_enabled_browser_count, default: 2 })
  maximumEnabledBrowserCount!: number;

  @Column({ type: 'boolean', name: SelfHostedLicenseTokenPropSnake.open_api_enabled, default: false })
  openApiEnabled!: boolean;

  @Column({ type: 'boolean', name: SelfHostedLicenseTokenPropSnake.dogu_agent_auto_update_enabled, default: false })
  doguAgentAutoUpdateEnabled!: boolean;

  @ColumnTemplate.CreateDate(SelfHostedLicenseTokenPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.CreateDate(SelfHostedLicenseTokenPropSnake.last_access_at)
  lastAccessAt!: Date;

  @ColumnTemplate.UpdateDate(SelfHostedLicenseTokenPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.Date(SelfHostedLicenseTokenPropSnake.expired_at, false)
  expiredAt!: Date;

  @ColumnTemplate.DeleteDate(SelfHostedLicenseTokenPropSnake.deleted_at)
  deletedAt!: Date | null;
}
