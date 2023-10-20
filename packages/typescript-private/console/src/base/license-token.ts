import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { LicenseBase } from './license';

export type LicenseTokenId = string;
export const LICENSE_TOKEN_TABEL_NAME = 'license_token';

interface LicenseTokenBaseRelationTraits {
  license?: LicenseBase;
}
export interface LicenseTokenBaseTraits {
  licenseTokenId: LicenseTokenId;
  token: string;
  createdAt: Date;
  expiredAt: Date | null;
  deletedAt: Date | null;
}

export type LicenseTokenBase = LicenseTokenBaseTraits & LicenseTokenBaseRelationTraits;
export const LicenseTokenPropCamel = propertiesOf<LicenseTokenBase>();
export const LicenseTokenPropSnake = camelToSnakeCasePropertiesOf<LicenseTokenBase>();
