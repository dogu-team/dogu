import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export const LICENSE_TIER_TABLE_NAME = 'license_tier';

export type LicenseTierId = number;

export enum LICENSE_TIER_TYPE {
  cloud_community = 0,
  cloud_enterprise_1 = 1,
  cloud_enterprise_2 = 2,
  cloud_enterprise_3 = 3,
  cloud_enterprise_4 = 4,
  self_hosted_community = 10,
  self_hosted_enterprise_1 = 11,
  self_hosted_enterprise_2 = 12,
  self_hosted_enterprise_3 = 13,
  self_hosted_enterprise_4 = 14,
}

export function getDeviceCountByTier(licenseTierType: LICENSE_TIER_TYPE): number {
  switch (licenseTierType) {
    case LICENSE_TIER_TYPE.cloud_community:
      return 2;
    case LICENSE_TIER_TYPE.self_hosted_community:
      return 2;
    case LICENSE_TIER_TYPE.cloud_enterprise_1:
      return 5;
    case LICENSE_TIER_TYPE.self_hosted_enterprise_1:
      return 5;
    case LICENSE_TIER_TYPE.cloud_enterprise_2:
      return 10;
    case LICENSE_TIER_TYPE.self_hosted_enterprise_2:
      return 10;
    case LICENSE_TIER_TYPE.cloud_enterprise_3:
      return 15;
    case LICENSE_TIER_TYPE.self_hosted_enterprise_3:
      return 15;
    case LICENSE_TIER_TYPE.cloud_enterprise_4:
      return 20;
    case LICENSE_TIER_TYPE.self_hosted_enterprise_4:
      return 20;
    default:
      const _exhaustiveCheck: never = licenseTierType;
      throw new Error(`Unknown license tier type: ${LICENSE_TIER_TYPE[_exhaustiveCheck]}`);
  }
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

export const DEFAULT_CLOUD_LICENSE_TIER_DATA: LicenseTierBase = {
  licenseTierId: LICENSE_TIER_TYPE.cloud_community,
  name: LICENSE_TIER_TYPE[LICENSE_TIER_TYPE.cloud_community],
  deviceCount: getDeviceCountByTier(LICENSE_TIER_TYPE.cloud_community),
  createdAt: new Date(),
  deletedAt: null,
};

export const DEFAULT_SELF_HOSTED_LICENSE_TIER_DATA: LicenseTierBase = {
  licenseTierId: LICENSE_TIER_TYPE.self_hosted_community,
  name: LICENSE_TIER_TYPE[LICENSE_TIER_TYPE.self_hosted_community],
  deviceCount: getDeviceCountByTier(LICENSE_TIER_TYPE.self_hosted_community),
  createdAt: new Date(),
  deletedAt: null,
};
