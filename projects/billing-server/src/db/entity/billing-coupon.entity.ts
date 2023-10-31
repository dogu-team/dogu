import { BillingCouponBase, BillingCouponPropSnake } from '@dogu-private/console';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_coupon')
export class BillingCoupon implements BillingCouponBase {
  @PrimaryColumn('uuid', { name: BillingCouponPropSnake.billing_coupon_id })
  billingCouponId!: string;

  @Column({ type: 'character varying', name: BillingCouponPropSnake.code, unique: true })
  code!: string;

  @Column({ type: 'integer', name: BillingCouponPropSnake.discount_percent })
  discountPercent!: number;

  @Column({ type: 'integer', name: BillingCouponPropSnake.remaining_count, nullable: true })
  remainingCount!: number | null;

  @ColumnTemplate.Date(BillingCouponPropSnake.expired_at, true)
  expiredAt!: Date | null;

  @ColumnTemplate.CreateDate(BillingCouponPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingCouponPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingCouponPropSnake.deleted_at)
  deletedAt!: Date | null;
}
