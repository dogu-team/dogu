import { BillingCategory, BillingCurrency, BillingHistoryType, BillingPeriod, BillingPlanHistoryBase, BillingPlanHistoryProp, BillingPlanType } from '@dogu-private/console';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';
import { BillingCoupon } from './billing-coupon.entity';
import { BillingHistory } from './billing-history.entity';
import { BillingOrganization } from './billing-organization.entity';
import { BillingPlanSource } from './billing-plan-source.entity';

@Entity()
export class BillingPlanHistory implements BillingPlanHistoryBase {
  @PrimaryColumn('uuid')
  billingPlanHistoryId!: string;

  @Column({ type: 'uuid' })
  billingOrganizationId!: string;

  @Column({ type: 'uuid' })
  billingHistoryId!: string;

  @Column({ type: 'uuid', nullable: true })
  billingCouponId!: string | null;

  @Column({ type: 'integer', nullable: true })
  billingPlanSourceId!: number | null;

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

  @Column({ type: 'enum', enum: BillingPlanType })
  type!: BillingPlanType;

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
  purchasedBillingPlanHistoryId!: string | null;

  @Column({ type: 'double precision', nullable: true })
  refundedAmount!: number | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => BillingOrganization, (billingOrganization) => billingOrganization.billingPlanHistories)
  @JoinColumn({ name: BillingPlanHistoryProp.billingOrganizationId })
  billingOrganization?: BillingOrganization;

  @ManyToOne(() => BillingCoupon)
  @JoinColumn({ name: BillingPlanHistoryProp.billingCouponId })
  billingCoupon?: BillingCoupon;

  @ManyToOne(() => BillingPlanSource)
  @JoinColumn({ name: BillingPlanHistoryProp.billingPlanSourceId })
  billingPlanSource?: BillingPlanSource;

  @ManyToOne(() => BillingHistory, (billingHistory) => billingHistory.billingPlanHistories)
  @JoinColumn({ name: BillingPlanHistoryProp.billingHistoryId })
  billingHistory?: BillingHistory;
}
