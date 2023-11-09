import {
  BillingCategory,
  BillingCurrency,
  BillingPeriod,
  BillingSubscriptionPlanInfoBase,
  BillingSubscriptionPlanProp,
  BillingSubscriptionPlanState,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingCoupon } from './billing-coupon.entity';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlanSource } from './billing-subscription-plan-source.entity';

@Entity()
export class BillingSubscriptionPlanInfo implements BillingSubscriptionPlanInfoBase {
  @PrimaryColumn('uuid')
  billingSubscriptionPlanInfoId!: string;

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

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'uuid', nullable: true })
  billingSubscriptionPlanSourceId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', nullable: true })
  couponRemainingApplyCount!: number | null;

  @Column({ type: 'double precision' })
  discountedAmount!: number;

  @Column({ type: 'enum', enum: BillingPeriod, nullable: true })
  changeRequestedPeriod!: BillingPeriod | null;

  @Column({ type: 'integer', nullable: true })
  changeRequestedOption!: number | null;

  @Column({ type: 'double precision', nullable: true })
  changeRequestedOriginPrice!: number | null;

  @Column({ type: 'double precision', nullable: true })
  changeRequestedDiscountedAmount!: number | null;

  @Column({ type: 'enum', enum: BillingSubscriptionPlanState })
  state!: BillingSubscriptionPlanState;

  @DateColumn({ nullable: true })
  unsubscribedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  billingSubscriptionPlanHistoryId!: string | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingSubscriptionPlanInfos)
  @JoinColumn({ name: BillingSubscriptionPlanProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToOne(() => BillingCoupon)
  @JoinColumn({ name: BillingSubscriptionPlanProp.billingCouponId })
  billingCoupon?: BillingCoupon;

  @ManyToOne(() => BillingSubscriptionPlanSource)
  @JoinColumn({ name: BillingSubscriptionPlanProp.billingSubscriptionPlanSourceId })
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSource;
}
