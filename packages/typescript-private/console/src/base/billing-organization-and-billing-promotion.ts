import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingOrganizationAndBillingPromotionBase {
  billingOrganizationId: string;
  billingPromotionId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingOrganizationAndBillingPromotionPropCamel = propertiesOf<BillingOrganizationAndBillingPromotionBase>();
export const BillingOrganizationAndBillingPromotionPropSnake = camelToSnakeCasePropertiesOf<BillingOrganizationAndBillingPromotionBase>();
