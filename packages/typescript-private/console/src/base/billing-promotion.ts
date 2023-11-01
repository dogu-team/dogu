import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingCategory } from './billing';

export const BillingPromotionType = ['first-purchase'] as const;
export type BillingPromotionType = (typeof BillingPromotionType)[number];

export interface BillingPromotionBase {
  billingPromitionId: string;
  category: BillingCategory;
  type: BillingPromotionType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const BillingPromotionPropCamel = propertiesOf<BillingPromotionBase>();
export const BillingPromotionPropSnake = camelToSnakeCasePropertiesOf<BillingPromotionBase>();

export class GetAvailableBillingPromotionsDto {
  @IsUUID()
  organizationId!: string;
}
