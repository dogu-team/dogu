import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { CloudSubscriptionPlanBase } from './cloud-subscription-plan';

export interface CloudLicenseBase {
  cloudLicenseId: string;
  organizationId: OrganizationId;
  liveTestingRemainingFreeSeconds: number;
  liveTestingParallelCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudSubscriptionPlans?: CloudSubscriptionPlanBase[];
}

export const CloudLicensePropCamel = propertiesOf<CloudLicenseBase>();
export const CloudLicensePropSnake = camelToSnakeCasePropertiesOf<CloudLicenseBase>();

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
