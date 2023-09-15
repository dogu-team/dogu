import { OrganizationId, TokenId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { TokenBase } from '..';
import { DEFAULT_SELF_HOSTED_LICENSE_TIER_DATA, LicenseSelfHostedTierBase, LicenseSelfHostedTierId } from './license-self-hosted-tier';

export type LicenseId = string;

export interface LicenseBaseRelationTraits {
  licenseTier?: LicenseSelfHostedTierBase;
  licenseToken?: TokenBase;
}

export const LicenseTypeKey = ['cloud', 'self-hosted'] as const;
export type LicenseType = (typeof LicenseTypeKey)[number];

export interface LicenseBaseTraits {
  licenseId: LicenseId;
  licenseTierId: LicenseSelfHostedTierId;
  type: LicenseType;
  licenseTokenId: TokenId;
  organizationId: OrganizationId | null;
  companyName: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  lastAccessedAt: Date;
}

export type LicenseBase = LicenseBaseTraits & LicenseBaseRelationTraits;
export const LicensePropCamel = propertiesOf<LicenseBase>();
export const LicensePropSnake = camelToSnakeCasePropertiesOf<LicenseBase>();

export class LicenseValidateClass implements LicenseBase {
  licenseId!: LicenseId;
  licenseTierId!: LicenseSelfHostedTierId;
  type!: LicenseType;
  licenseTokenId!: TokenId;
  organizationId!: OrganizationId | null;
  companyName!: string | null;
  createdAt!: Date;
  deletedAt!: Date | null;
  licenseTier?: LicenseSelfHostedTierBase;
  licenseToken?: TokenBase;
  lastAccessedAt!: Date;
}

// export const DEFAULT_CLOUD_LICENSE_DATA: LicenseBase = {
//   licenseId: '',
//   licenseTierId: 0,
//   type: 'cloud',
//   licenseTokenId: '',
//   organizationId: null,
//   companyName: null,
//   createdAt: new Date(),
//   deletedAt: null,
//   licenseTier: DEFAULT_CLOUD_LICENSE_TIER_DATA,
//   licenseToken: undefined,
// };

export const DEFAULT_SELF_HOSTED_LICENSE_DATA: LicenseBase = {
  licenseId: '',
  licenseTierId: 0,
  type: 'self-hosted',
  licenseTokenId: '',
  organizationId: null,
  companyName: null,
  createdAt: new Date(),
  deletedAt: null,
  licenseTier: DEFAULT_SELF_HOSTED_LICENSE_TIER_DATA,
  licenseToken: undefined,
  lastAccessedAt: new Date(),
};
