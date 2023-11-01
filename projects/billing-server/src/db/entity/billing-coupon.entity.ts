import { BillingCouponBase, BillingCouponPropSnake, BillingCouponType } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_coupon')
export class BillingCoupon implements BillingCouponBase {
  @PrimaryColumn('uuid', { name: BillingCouponPropSnake.billing_coupon_id })
  billingCouponId!: string;

  @Column({ type: 'character varying', name: BillingCouponPropSnake.code, unique: true })
  code!: string;

  @Column({ type: 'enum', name: BillingCouponPropSnake.type, enum: BillingCouponType, default: 'basic' })
  type!: BillingCouponType;

  @Column({ type: 'integer', name: BillingCouponPropSnake.monthly_discount_percent, nullable: true })
  monthlyDiscountPercent!: number | null;

  @Column({ type: 'integer', name: BillingCouponPropSnake.monthly_apply_count, nullable: true })
  monthlyApplyCount!: number | null;

  @Column({ type: 'integer', name: BillingCouponPropSnake.yearly_discount_percent, nullable: true })
  yearlyDiscountPercent!: number | null;

  @Column({ type: 'integer', name: BillingCouponPropSnake.yearly_apply_count, nullable: true })
  yearlyApplyCount!: number | null;

  @Column({ type: 'integer', name: BillingCouponPropSnake.remaining_available_count, nullable: true })
  remainingAvailableCount!: number | null;

  @ColumnTemplate.Date(BillingCouponPropSnake.expired_at, true)
  expiredAt!: Date | null;

  @ColumnTemplate.CreateDate(BillingCouponPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingCouponPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingCouponPropSnake.deleted_at)
  deletedAt!: Date | null;
}
