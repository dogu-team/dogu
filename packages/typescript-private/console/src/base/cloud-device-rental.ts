import { CloudDeviceId, CloudDeviceRentalId, OrganizationId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { CloudDeviceBase } from '..';
import { OrganizationBase } from './organization';

interface CloudDeviceRentalRelationTraits {
  organization?: OrganizationBase;
  cloudDevice?: CloudDeviceBase;
  comtomerId?: UserId;
}

export interface CloudDeviceRentalBaseTraits {
  cloudDeviceRentalId: CloudDeviceRentalId;
  organizationId: OrganizationId;
  cloudDeviceId: CloudDeviceId;
  customerId: UserId;
  startedAt: Date;
  endedAt: Date | null;
}

export type CloudDeviceRentalBase = CloudDeviceRentalBaseTraits & CloudDeviceRentalRelationTraits;
export const CloudDeviceRentalPropCamel = propertiesOf<CloudDeviceRentalBase>();
export const CloudDeviceRentalPropSnake = camelToSnakeCasePropertiesOf<CloudDeviceRentalBase>();
