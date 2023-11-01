import { BillingInfoAndBillingCouponBase, BillingInfoAndBillingCouponPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_info_and_billing_coupon')
export class BillingInfoAndBillingCoupon implements BillingInfoAndBillingCouponBase {
  @PrimaryColumn('uuid', { name: BillingInfoAndBillingCouponPropSnake.billing_info_id })
  billingInfoId!: string;

  @PrimaryColumn('uuid', { name: BillingInfoAndBillingCouponPropSnake.billing_coupon_id })
  billingCouponId!: string;

  @ColumnTemplate.CreateDate(BillingInfoAndBillingCouponPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingInfoAndBillingCouponPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingInfoAndBillingCouponPropSnake.deleted_at)
  deletedAt!: Date | null;
}
