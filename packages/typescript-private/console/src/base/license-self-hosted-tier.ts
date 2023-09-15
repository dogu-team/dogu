import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export const LICENSE_SELF_HOSTED_TIER_TABLE_NAME = 'license_self_hotsed_tier';

export type LicenseSelfHostedTierId = number;

export enum LICENSE_SELF_HOSTED_TIER_TYPE {
  self_hosted_community = 0,
  self_hosted_enterprise_1 = 1,
  self_hosted_enterprise_2 = 2,
  self_hosted_enterprise_3 = 3,
  self_hosted_enterprise_4 = 4,
}

export function getDeviceCountByTier(licenseTierType: LICENSE_SELF_HOSTED_TIER_TYPE): number {
  switch (licenseTierType) {
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community:
      return 3;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_1:
      return 5;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_2:
      return 10;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_3:
      return 15;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_4:
      return 20;
    default:
      const _exhaustiveCheck: never = licenseTierType;
      throw new Error(`Unknown license tier type: ${LICENSE_SELF_HOSTED_TIER_TYPE[_exhaustiveCheck]}`);
  }
}

export function getOpenApiEnableByTier(licenseTierType: LICENSE_SELF_HOSTED_TIER_TYPE): boolean {
  switch (licenseTierType) {
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community:
      return false;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_1:
      return true;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_2:
      return true;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_3:
      return true;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_4:
      return true;
    default:
      const _exhaustiveCheck: never = licenseTierType;
      throw new Error(`Unknown license tier type: ${LICENSE_SELF_HOSTED_TIER_TYPE[_exhaustiveCheck]}`);
  }
}

export function getDoguAgentAutoUpdateEnableByTier(licenseTierType: LICENSE_SELF_HOSTED_TIER_TYPE): boolean {
  switch (licenseTierType) {
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community:
      return false;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_1:
      return true;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_2:
      return true;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_3:
      return true;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_enterprise_4:
      return true;
    default:
      const _exhaustiveCheck: never = licenseTierType;
      throw new Error(`Unknown license tier type: ${LICENSE_SELF_HOSTED_TIER_TYPE[_exhaustiveCheck]}`);
  }
}

export interface LicenseSelfHostedTierBaseTraits {
  licenseSelfHostedTierId: LicenseSelfHostedTierId;
  name: string;
  deviceCount: number;
  openApiEnabled: boolean;
  doguAgentAutoUpdateEnabled: boolean;
  createdAt: Date;
  deletedAt: Date | null;
}

export type LicenseSelfHostedTierBase = LicenseSelfHostedTierBaseTraits;
export const LicenseSelfHostedTierPropCamel = propertiesOf<LicenseSelfHostedTierBase>();
export const LicenseSelfHostedTierPropSnake = camelToSnakeCasePropertiesOf<LicenseSelfHostedTierBase>();

export const DEFAULT_SELF_HOSTED_LICENSE_TIER_DATA: LicenseSelfHostedTierBase = {
  licenseSelfHostedTierId: LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community,
  name: LICENSE_SELF_HOSTED_TIER_TYPE[LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community],
  deviceCount: getDeviceCountByTier(LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community),
  openApiEnabled: getOpenApiEnableByTier(LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community),
  doguAgentAutoUpdateEnabled: getDoguAgentAutoUpdateEnableByTier(LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community),
  createdAt: new Date(),
  deletedAt: null,
};
