import { OrganizationId } from '@dogu-private/types';
import { IsFilledString, propertiesOf } from '@dogu-tech/common';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { BillingOrganizationBase } from './billing-organization';

export interface BillingMethodPaddleBase {
  billingMethodPaddleId: string;
  billingOrganizationId: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const BillingMethodPaddleProp = propertiesOf<BillingMethodPaddleBase>();

export class UpdateBillingEmailDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsFilledString()
  email!: string;
}

export class UpdateBillingAddressDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsString()
  @IsOptional()
  firstLine?: string;

  @IsString()
  @IsOptional()
  secondLine?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;
}

export interface BillingAddress {
  firstLine: string | null;
  secondLine: string | null;
  city: string | null;
  postalCode: string | null;
  region: string | null;
  countryCode: string | null;
}

export type UpdateBillingAddressResponse = BillingAddress;

export class UpdateBillingBusinessDto {
  @IsUUID()
  organizationId!: OrganizationId;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  companyNumber?: string;

  @IsString()
  @IsOptional()
  taxIdentifier?: string;
}

export interface BillingBusiness {
  name: string | null;
  companyNumber: string | null;
  taxIdentifier: string | null;
}

export type UpdateBillingBusinessResponse = BillingBusiness;

export interface BillingMethodPaddleResponse extends BillingMethodPaddleBase {
  address?: BillingAddress;
  business?: BillingBusiness;
}
