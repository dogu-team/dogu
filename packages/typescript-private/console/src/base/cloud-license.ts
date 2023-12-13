import { OrganizationId } from '@dogu-private/types';
import { propertiesOf } from '@dogu-tech/common';
import { IsIn, IsNumber, IsUUID } from 'class-validator';
import { BillingCategory, BillingPlanType } from './billing';
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

export class CloudLicenseUpdateMessage {
  @IsUUID()
  organizationId!: string;

  @IsIn(BillingPlanType)
  planType!: BillingPlanType;

  @IsNumber()
  usedSeconds!: number;
}

export type CloudLicenseEventMessage = Omit<CloudLicenseBase, 'billingOrganizationId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'billingOrganization' | 'category'>;

export interface CloudLicenseResponse extends CloudLicenseBase {
  billingOrganization: BillingOrganizationResponse;
}

export type CloudLicenseLiveTestingEvent = {
  remainingFreeSeconds: number;
};
