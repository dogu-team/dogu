import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingOrganizationAndBillingCouponBase {
  billingOrganizationId: string;
  billingCouponId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingOrganizationAndBillingCouponPropCamel = propertiesOf<BillingOrganizationAndBillingCouponBase>();
export const BillingOrganizationAndBillingCouponPropSnake = camelToSnakeCasePropertiesOf<BillingOrganizationAndBillingCouponBase>();
