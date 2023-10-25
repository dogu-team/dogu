import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { CloudSubscriptionItemBase } from './cloud-subscription-item';

export interface CloudLicenseBase {
  cloudLicenseId: string;
  organizationId: OrganizationId;
  remainingFreeSeconds: number;
  liveTestingParallelCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudSubscriptionItems?: CloudSubscriptionItemBase[];
}

export const CloudLicenseBasePropCamel = propertiesOf<CloudLicenseBase>();
export const CloudLicensePropSnake = camelToSnakeCasePropertiesOf<CloudLicenseBase>();

export namespace CloudLicenseMessage {
  export class RemainingFreeSecondsSend {
    @IsUUID()
    cloudLicenseId!: string;

    @IsNumber()
    seconds!: number;
  }

  export class RemainingFreeSecondsReceive {
    @IsUUID()
    cloudLicenseId!: string;

    @IsBoolean()
    expired!: boolean;

    @IsNumber()
    remainingFreeSeconds!: number;
  }
}
