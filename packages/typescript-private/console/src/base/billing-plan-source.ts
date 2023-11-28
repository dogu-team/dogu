import { propertiesOf } from '@dogu-tech/common';
import { IsUUID } from 'class-validator';
import { BillingPlanData } from './billing';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingPlanSourceBase extends BillingPlanData {
  billingPlanSourceId: number;
  name: string;
  billingOrganizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingPlanSourceProp = propertiesOf<BillingPlanSourceBase>();

export class FindAllBillingPlanSourcesDto {
  @IsUUID()
  organizationId!: string;
}
