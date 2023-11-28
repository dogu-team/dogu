import { BillingCouponBase, BillingCouponType, BillingPeriod, BillingPlanType } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CreatedAt, DateColumn, DeletedAt, UpdatedAt } from '../decorators';

export const BillingCouponTableName = 'billing_coupon';

@Entity(BillingCouponTableName)
export class BillingCoupon implements BillingCouponBase {
  @PrimaryColumn('uuid')
  billingCouponId!: string;

  @Column({ type: 'character varying', unique: true })
  code!: string;

  @Column({ type: 'enum', enum: BillingCouponType, default: 'basic' })
  type!: BillingCouponType;

  @Column({ type: 'enum', enum: BillingPlanType, nullable: true })
  planType!: BillingPlanType | null;

  @Column({ type: 'enum', enum: BillingPeriod })
  period!: BillingPeriod;

  @Column({ type: 'integer' })
  discountPercent!: number;

  @Column({ type: 'integer', nullable: true })
  applyCount!: number | null;

  @Column({ type: 'integer', nullable: true })
  remainingAvailableCount!: number | null;

  @DateColumn({ nullable: true })
  expiredAt!: Date | null;

  @CreatedAt()
  createdAt!: Date;

  @UpdatedAt()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;
}
