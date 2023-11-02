import { propertiesOf } from '@dogu-tech/common';

export interface BillingOrganizationUsedBillingCouponBase {
  billingOrganizationId: string;
  billingCouponId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingOrganizationUsedBillingCouponProp = propertiesOf<BillingOrganizationUsedBillingCouponBase>();
