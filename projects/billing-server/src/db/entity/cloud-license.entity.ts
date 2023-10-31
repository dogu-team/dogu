import { CloudLicenseBase, CloudLicensePropSnake } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CloudSubscriptionPlanCustomOption } from './cloud-subscription-plan-custom-option.entity';
import { CloudSubscriptionPlan } from './cloud-subscription-plan.entity';
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

  @ColumnTemplate.Date(CloudLicensePropSnake.first_billing_at, true)
  firstBillingAt!: Date | null;

  @ColumnTemplate.CreateDate(CloudLicensePropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(CloudLicensePropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudLicensePropSnake.deleted_at)
  deletedAt!: Date | null;

  @OneToMany(() => CloudSubscriptionPlan, (cloudSubscriptionPlan) => cloudSubscriptionPlan.cloudLicense, { cascade: ['soft-remove'] })
  cloudSubscriptionPlans?: CloudSubscriptionPlan[];

  @OneToMany(() => CloudSubscriptionPlanCustomOption, (cloudSubscriptionPlanCustomOption) => cloudSubscriptionPlanCustomOption.cloudLicense, { cascade: ['soft-remove'] })
  cloudSubscriptionPlanCustomOptions?: CloudSubscriptionPlanCustomOption[];
}
