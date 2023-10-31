import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface BillingHistoryBase {
  billingHistoryId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingHistoryPropCamel = propertiesOf<BillingHistoryBase>();
export const BillingHistoryPropSnake = camelToSnakeCasePropertiesOf<BillingHistoryBase>();
