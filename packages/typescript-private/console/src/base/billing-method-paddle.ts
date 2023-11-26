import { OrganizationId } from '@dogu-private/types';
import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingMethodPaddleBase {
  billingMethodPaddleId: string;
  billingOrganizationId: string;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingMethodPaddleProp = propertiesOf<BillingMethodPaddleBase>();

export class CreateOrUpdateMethodPaddleDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsFilledString()
  email!: string;
}

export class PaddlePriceSourceDto {}
