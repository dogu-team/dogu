import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export const LICENSE_SELF_HOSTED_TIER_TABLE_NAME = 'license_self_hotsed_tier';

export type LicenseSelfHostedTierId = number;

export enum LICENSE_SELF_HOSTED_TIER_TYPE {
  self_hosted_community = 0,
  self_hosted_default_dogutech = 1,
}

export function getDefaultMaxMobileEnableCountByTier(licenseTierType: LICENSE_SELF_HOSTED_TIER_TYPE): number {
  switch (licenseTierType) {
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community:
      return 1;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_default_dogutech:
      return 999;
    default:
      const _exhaustiveCheck: never = licenseTierType;
      throw new Error(`Unknown license tier type: ${LICENSE_SELF_HOSTED_TIER_TYPE[_exhaustiveCheck]}`);
  }
}

export function getDefaultMaxBrowserEnableCountByTier(licenseTierType: LICENSE_SELF_HOSTED_TIER_TYPE): number {
  switch (licenseTierType) {
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community:
      return 2;
    case LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_default_dogutech:
      return 999;
    default:
      const _exhaustiveCheck: never = licenseTierType;
      throw new Error(`Unknown license tier type: ${LICENSE_SELF_HOSTED_TIER_TYPE[_exhaustiveCheck]}`);
  }
}

export interface LicenseSelfHostedTierBaseTraits {
  licenseSelfHostedTierId: LicenseSelfHostedTierId;
  name: string;
  maxMobileEnableCount: number;
  maxBrowserEnableCount: number;
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
  maxMobileEnableCount: getDefaultMaxMobileEnableCountByTier(LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community),
  maxBrowserEnableCount: getDefaultMaxBrowserEnableCountByTier(LICENSE_SELF_HOSTED_TIER_TYPE.self_hosted_community),
  openApiEnabled: false,
  doguAgentAutoUpdateEnabled: false,
  createdAt: new Date(),
  deletedAt: null,
};
