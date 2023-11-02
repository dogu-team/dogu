import { BillingCategory, BillingCurrency, BillingPeriod, BillingSubscriptionPlanBase, BillingSubscriptionPlanProp, BillingSubscriptionPlanType } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BillingCoupon } from './billing-coupon.entity';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlanSource } from './billing-subscription-plan-source.entity';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from './util/decorators';

@Entity()
export class BillingSubscriptionPlan implements BillingSubscriptionPlanBase {
  @PrimaryColumn('uuid')
  billingSubscriptionPlanId!: string;

  @Column({ type: 'enum', enum: BillingCategory })
  category!: BillingCategory;

  @Column({ type: 'enum', enum: BillingSubscriptionPlanType })
  type!: BillingSubscriptionPlanType;

  @Column({ type: 'integer' })
  option!: number;

  @Column({ type: 'enum', enum: BillingCurrency })
  currency!: BillingCurrency;

  @Column({ type: 'enum', enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'double precision' })
  originPrice!: number;

  @Column({ type: 'double precision' })
  lastPurchasedPrice!: number;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'uuid', nullable: true })
  billingSubscriptionPlanSourceId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', nullable: true })
  billingCouponRemainingApplyCount!: number | null;

  @DateColumn()
  unsubscribedAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingSubscriptionPlans)
  @JoinColumn({ name: BillingSubscriptionPlanProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToOne(() => BillingCoupon)
  @JoinColumn({ name: BillingSubscriptionPlanProp.billingCouponId })
  billingCoupon?: BillingCoupon;

  @ManyToOne(() => BillingSubscriptionPlanSource)
  @JoinColumn({ name: BillingSubscriptionPlanProp.billingSubscriptionPlanSourceId })
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSource;
}
