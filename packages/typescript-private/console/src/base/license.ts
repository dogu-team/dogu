import { OrganizationId, TokenId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { LicenseTierBase, LicenseTierId } from './license-tier';
import { TokenBase } from './token';

export type LicenseId = string;

export interface LicenseBaseRelationTraits {
  licenseTier?: LicenseTierBase;
  token?: TokenBase;
}

export const LicenseTypeKey = ['cloud', 'self-hosted'] as const;
export type LicenseType = (typeof LicenseTypeKey)[number];

export interface LicenseBaseTraits {
  licenseId: LicenseId;
  licenseTierId: LicenseTierId;
  type: LicenseType;
  tokenId: TokenId;
  organizationId: OrganizationId | null;
  companyName: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export type LicenseBase = LicenseBaseTraits & LicenseBaseRelationTraits;
export const LicensePropCamel = propertiesOf<LicenseBase>();
export const LicensePropSnake = camelToSnakeCasePropertiesOf<LicenseBase>();

export class LicenseValidateClass implements LicenseBase {
  licenseId!: LicenseId;
  licenseTierId!: LicenseTierId;
  type!: LicenseType;
  tokenId!: TokenId;
  organizationId!: OrganizationId | null;
  companyName!: string | null;
  createdAt!: Date;
  deletedAt!: Date | null;
  licenseTier?: LicenseTierBase;
  token?: TokenBase;
}
