import {
  BillingCategory,
  BillingCurrency,
  BillingHistoryType,
  BillingPeriod,
  BillingSubscriptionPlanHistoryBase,
  BillingSubscriptionPlanHistoryProp,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingCoupon } from './billing-coupon.entity';
import { BillingHistory } from './billing-history.entity';
import { BillingOrganization } from './billing-organization.entity';
import { BillingSubscriptionPlanSource } from './billing-subscription-plan-source.entity';

@Entity()
export class BillingSubscriptionPlanHistory implements BillingSubscriptionPlanHistoryBase {
  @PrimaryColumn('uuid')
  billingSubscriptionPlanHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'uuid' })
  billingHistoryId!: string;

  @Column({ type: 'uuid', nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', nullable: true })
  billingSubscriptionPlanSourceId!: number | null;

  @Column({ type: 'double precision', nullable: true })
  discountedAmount!: number | null;

  @Column({ type: 'double precision', nullable: true })
  purchasedAmount!: number | null;

  @DateColumn({ nullable: true })
  startedAt!: Date | null;

  @DateColumn({ nullable: true })
  expiredAt!: Date | null;

  @Column({ type: 'integer', nullable: true })
  elapsedDays!: number | null;

  @Column({ type: 'double precision', nullable: true })
  elapsedDiscountedAmount!: number | null;

  @Column({ type: 'integer', nullable: true })
  previousRemainingDays!: number | null;

  @Column({ type: 'double precision', nullable: true })
  previousRemainingDiscountedAmount!: number | null;

  @Column({ type: 'integer', nullable: true })
  previousOption!: number | null;

  @Column({ type: 'enum', enum: BillingPeriod, nullable: true })
  previousPeriod!: BillingPeriod | null;

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

  @Column({ type: 'enum', enum: BillingHistoryType })
  historyType!: BillingHistoryType;

  @Column({ type: 'uuid', nullable: true })
  purchasedBillingSubscriptionPlanHistoryId!: string | null;

  @Column({ type: 'double precision', nullable: true })
  refundedAmount!: number | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingSubscriptionPlanHistories)
  @JoinColumn({ name: BillingSubscriptionPlanHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToOne(() => BillingCoupon)
  @JoinColumn({ name: BillingSubscriptionPlanHistoryProp.billingCouponId })
  billingCoupon?: BillingCoupon;

  @ManyToOne(() => BillingSubscriptionPlanSource)
  @JoinColumn({ name: BillingSubscriptionPlanHistoryProp.billingSubscriptionPlanSourceId })
  billingSubscriptionPlanSource?: BillingSubscriptionPlanSource;

  @ManyToOne(() => BillingHistory, (billingHistory) => billingHistory.billingSubscriptionPlanHistories)
  @JoinColumn({ name: BillingSubscriptionPlanHistoryProp.billingHistoryId })
  billingHistory?: BillingHistory;
}
