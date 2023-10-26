import { CloudLicenseBase, CloudLicensePropSnake } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CloudSubscriptionItem } from './cloud-subscription-item.entity';

import { ColumnTemplate } from './util/decorators';

@Entity('cloud_license')
export class CloudLicense implements CloudLicenseBase {
  @PrimaryColumn('uuid', { name: CloudLicensePropSnake.cloud_license_id })
  cloudLicenseId!: string;

  @Column({ type: 'character varying', name: CloudLicensePropSnake.organization_id, unique: true })
  organizationId!: OrganizationId;

  @Column({ type: 'integer', name: CloudLicensePropSnake.live_testing_remaining_free_seconds, default: 180 * 60 })
  liveTestingRemainingFreeSeconds!: number;

  @Column({ type: 'integer', name: CloudLicensePropSnake.live_testing_parallel_count, default: 1 })
  liveTestingParallelCount!: number;

  @ColumnTemplate.CreateDate(CloudLicensePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(CloudLicensePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudLicensePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => CloudSubscriptionItem, (cloudSubscriptionItem) => cloudSubscriptionItem.cloudLicense, { cascade: ['soft-remove'] })
  cloudSubscriptionItems?: CloudSubscriptionItem[];
}
