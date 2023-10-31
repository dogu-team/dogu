import {
  BillingCurrency,
  BillingPeriod,
  CloudSubscriptionPlanBase,
  CloudSubscriptionPlanPropCamel,
  CloudSubscriptionPlanPropSnake,
  CloudSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CloudLicense } from './cloud-license.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('cloud_subscription_plan')
export class CloudSubscriptionPlan implements CloudSubscriptionPlanBase {
  @PrimaryColumn('uuid', { name: CloudSubscriptionPlanPropSnake.cloud_subscription_plan_id })
  cloudSubscriptionPlanId!: string;

  @Column({ type: 'enum', name: CloudSubscriptionPlanPropSnake.type, enum: CloudSubscriptionPlanType, nullable: false })
  type!: CloudSubscriptionPlanType;

  @Column({ type: 'integer', name: CloudSubscriptionPlanPropSnake.option, nullable: false })
  option!: number;

  @Column({ type: 'enum', name: CloudSubscriptionPlanPropSnake.currency, enum: BillingCurrency, nullable: false })
  currency!: BillingCurrency;

  @Column({ type: 'enum', name: CloudSubscriptionPlanPropSnake.period, enum: BillingPeriod, nullable: false })
  period!: BillingPeriod;

  @Column({ type: 'integer', name: CloudSubscriptionPlanPropSnake.price, nullable: false })
  price!: number;

  @Column({ type: 'uuid', name: CloudSubscriptionPlanPropSnake.cloud_license_id })
  cloudLicenseId!: string;

  @Column({ type: 'uuid', name: CloudSubscriptionPlanPropSnake.billing_coupon_id, nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', name: CloudSubscriptionPlanPropSnake.billing_coupon_remaining_apply_count, nullable: true })
  billingCouponRemainingApplyCount!: number | null;

  @ColumnTemplate.CreateDate(CloudSubscriptionPlanPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(CloudSubscriptionPlanPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(CloudSubscriptionPlanPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => CloudLicense, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: CloudSubscriptionPlanPropSnake.cloud_license_id, referencedColumnName: CloudSubscriptionPlanPropCamel.cloudLicenseId })
  cloudLicense?: CloudLicense;
}
