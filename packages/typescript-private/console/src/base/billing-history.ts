import { propertiesOf } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { PageDtoBase } from '../dto/pagination/page.dto';
import { BillingMethod } from './billing';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingHistoryBase {
  billingHistoryId: string;
  billingOrganizationId: string;
  purchasedAt: Date;
  method: BillingMethod;
  niceSubscribePaymentsResponse: Record<string, unknown> | null;
  previewResponse: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingHistoryProp = propertiesOf<BillingHistoryBase>();

export class GetBillingHistoriesDto implements PageDtoBase {
  @IsUUID()
  organizationId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page = 1;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  offset = 10;
}
