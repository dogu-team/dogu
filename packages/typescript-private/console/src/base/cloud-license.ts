import { OrganizationId } from '@dogu-private/types';
import { propertiesOf } from '@dogu-tech/common';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { BillingOrganizationBase } from './billing-organization';

export interface CloudLicenseBase {
  cloudLicenseId: string;
  billingOrganizationId: string;
  organizationId: OrganizationId;
  liveTestingRemainingFreeSeconds: number;
  liveTestingParallelCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingOrganization?: BillingOrganizationBase;
}

export const CloudLicenseProp = propertiesOf<CloudLicenseBase>();

export class FindCloudLicenseDto {
  @IsUUID()
  organizationId!: string;
}

export namespace CloudLicenseMessage {
  export class LiveTestingSend {
    @IsUUID()
    cloudLicenseId!: string;

    @IsNumber()
    usedFreeSeconds!: number | null;
  }

  export class LiveTestingReceive {
    @IsUUID()
    cloudLicenseId!: string;

    @IsBoolean()
    expired!: boolean;

    @IsNumber()
    remainingFreeSeconds!: number;
  }
}
