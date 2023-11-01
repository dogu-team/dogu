import { BillingOrganizationAndBillingCouponBase, BillingOrganizationAndBillingCouponPropSnake } from '@dogu-private/console';
import { Entity, PrimaryColumn } from 'typeorm';
import { ColumnTemplate } from './util/decorators';

@Entity('billing_organization_and_billing_coupon')
export class BillingOrganizationAndBillingCoupon implements BillingOrganizationAndBillingCouponBase {
  @PrimaryColumn('uuid', { name: BillingOrganizationAndBillingCouponPropSnake.billing_organization_id })
  billingOrganizationId!: string;

  @PrimaryColumn('uuid', { name: BillingOrganizationAndBillingCouponPropSnake.billing_coupon_id })
  billingCouponId!: string;

  @ColumnTemplate.CreateDate(BillingOrganizationAndBillingCouponPropSnake.created_at)
  createdAt!: Date;

  @ColumnTemplate.UpdateDate(BillingOrganizationAndBillingCouponPropSnake.updated_at)
  updatedAt!: Date;

  @ColumnTemplate.DeleteDate(BillingOrganizationAndBillingCouponPropSnake.deleted_at)
  deletedAt!: Date | null;
}
