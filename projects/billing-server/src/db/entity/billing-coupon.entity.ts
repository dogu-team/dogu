import { BillingCouponBase } from '@dogu-private/console';
import { Entity } from 'typeorm';

@Entity('billing_coupon')
export class BillingCoupon implements BillingCouponBase {
  billingCouponId: string;
  code: string;
  discountPercent: number;
  remainingCount: number | null;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
