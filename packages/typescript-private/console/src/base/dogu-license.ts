import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { LicenseType } from './license';

export const DOGU_LICENSE_TABLE_NAME = 'dogu_license';
export type DoguLicenseId = string;

export interface DoguLicenseBaseTraits {
  doguLicenseId: DoguLicenseId;
  type: LicenseType;
  token: string;
  organizationId: OrganizationId | null;
  companyName: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export type DoguLicenseBase = DoguLicenseBaseTraits;
export const DoguLicensePropCamel = propertiesOf<DoguLicenseBase>();
export const DoguLicensePropSnake = camelToSnakeCasePropertiesOf<DoguLicenseBase>();
