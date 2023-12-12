import { OrganizationId } from '@dogu-private/types';
import { propertiesOf } from '@dogu-tech/common';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { BillingCategory } from '..';
import { BillingOrganizationBase, BillingOrganizationResponse } from './billing-organization';

export interface CloudLicenseBase {
  cloudLicenseId: string;
  billingOrganizationId: string;
  organizationId: OrganizationId;
  liveTestingRemainingFreeSeconds: number;
  liveTestingParallelCount: number;
  webTestAutomationRemainingFreeSeconds: number;
  webTestAutomationParallelCount: number;
  mobileAppTestAutomationRemainingFreeSeconds: number;
  mobileAppTestAutomationParallelCount: number;
  mobileGameTestAutomationRemainingFreeSeconds: number;
  mobileGameTestAutomationParallelCount: number;
  selfDeviceBrowserCount: number;
  selfDeviceMobileCount: number;
  category: BillingCategory;
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

export interface CloudLicenseResponse extends CloudLicenseBase {
  billingOrganization: BillingOrganizationResponse;
}
