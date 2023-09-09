import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export type LicenseTierId = number;
export enum LICENSE_TIER_TYPE {
  community = 1,
  enterprise_1 = 2,
  enterprise_2 = 3,
}

export interface LicenseTierBaseTraits {
  licenseTierId: LicenseTierId;
  name: string;
  deviceCount: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export type LicenseTierBase = LicenseTierBaseTraits;
export const LicenseTierPropCamel = propertiesOf<LicenseTierBase>();
export const LicenseTierPropSnake = camelToSnakeCasePropertiesOf<LicenseTierBase>();
