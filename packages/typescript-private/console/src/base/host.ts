import { Host } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { OrganizationBase } from './organization';
import { TokenBase } from './token';
import { UserBase } from './user';

interface HostRelationTraits {
  organization?: OrganizationBase;
  devices?: DeviceBase[];
  creator?: UserBase;
  token?: TokenBase;
  hostDevice?: DeviceBase;
}

export type HostBase = Host & HostRelationTraits;

export const HostPropCamel = propertiesOf<HostBase>();
export const HostPropSnake = camelToSnakeCasePropertiesOf<HostBase>();
