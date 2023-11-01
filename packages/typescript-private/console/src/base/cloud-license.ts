import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { BillingInfoBase } from './billing-info';

export interface CloudLicenseBase {
  cloudLicenseId: string;
  organizationId: OrganizationId;
  liveTestingRemainingFreeSeconds: number;
  liveTestingParallelCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  billingInfo?: BillingInfoBase | null;
}

export const CloudLicensePropCamel = propertiesOf<CloudLicenseBase>();
export const CloudLicensePropSnake = camelToSnakeCasePropertiesOf<CloudLicenseBase>();

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
