import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudLicenseBase } from './cloud-license';

export const CloudSubscriptionItemType = ['live-testing'] as const;
export type CloudSubscriptionItemType = (typeof CloudSubscriptionItemType)[number];

export interface CloudSubscriptionItemBase {
  cloudSubscriptionItemId: string;
  type: CloudSubscriptionItemType;
  cloudLicenseId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  cloudLicense?: CloudLicenseBase;
}

export const CloudSubscriptionItemBasePropCamel = propertiesOf<CloudSubscriptionItemBase>();
export const CloudSubscriptionItemPropSnake = camelToSnakeCasePropertiesOf<CloudSubscriptionItemBase>();
