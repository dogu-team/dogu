import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingSubscriptionPlanBase,
  BillingSubscriptionPlanPropCamel,
  BillingSubscriptionPlanPropSnake,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BillingCoupon } from './billing-coupon.entity';
import { BillingInfo } from './billing-info.entity';
import { BillingSubscriptionPlanSource } from './billing-subscription-plan-source.entity';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_subscription_plan')
export class BillingSubscriptionPlan implements BillingSubscriptionPlanBase {
  @PrimaryColumn('uuid', { name: BillingSubscriptionPlanPropSnake.billing_subscription_plan_id })
  billingSubscriptionPlanId!: string;

  @Column({ type: 'enum', name: BillingSubscriptionPlanPropSnake.category, enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', name: BillingSubscriptionPlanPropSnake.type, enum: BillingSubscriptionPlanType })
  type!: BillingSubscriptionPlanType;

  @Column({ type: 'integer', name: BillingSubscriptionPlanPropSnake.option })
  option!: number;

  @Column({ type: 'enum', name: BillingSubscriptionPlanPropSnake.currency, enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', name: BillingSubscriptionPlanPropSnake.period, enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'integer', name: BillingSubscriptionPlanPropSnake.price })
  price!: number;

  @Column({ type: 'uuid', name: BillingSubscriptionPlanPropSnake.billing_info_id })
  billingInfoId!: string;

  @Column({ type: 'uuid', name: BillingSubscriptionPlanPropSnake.billing_subscription_plan_source_id, nullable: true })
  billingSubscriptionPlanSourceId!: string | null;

  @Column({ type: 'uuid', name: BillingSubscriptionPlanPropSnake.billing_coupon_id, nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', name: BillingSubscriptionPlanPropSnake.billing_coupon_remaining_apply_count, nullable: true })
  billingCouponRemainingApplyCount!: number | null;

  @ColumnTemplate.CreateDate(BillingSubscriptionPlanPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingSubscriptionPlanPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingSubscriptionPlanPropSnake.deleted_at)
  deletedAt!: Date | null;

  @ManyToOne(() => BillingInfo, (billingInfo) => billingInfo.billingSubscriptionPlans)
  @JoinColumn({ name: BillingSubscriptionPlanPropSnake.billing_info_id, referencedColumnName: BillingSubscriptionPlanPropCamel.billingInfoId })
  billingInfo?: BillingInfo;

  @ManyToOne(() => BillingCoupon)
  @JoinColumn({ name: BillingSubscriptionPlanPropSnake.billing_coupon_id, referencedColumnName: BillingSubscriptionPlanPropCamel.billingCouponId })
  billingCoupon?: BillingCoupon;

  @ManyToOne(() => BillingSubscriptionPlanSource)
  @JoinColumn({
    name: BillingSubscriptionPlanPropSnake.billing_subscription_plan_source_id,
    referencedColumnName: BillingSubscriptionPlanPropCamel.billingSubscriptionPlanSourceId,
  })
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSource;
}
