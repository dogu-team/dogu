import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export const DOGU_LICENSE_TABLE_NAME = 'dogu_license';
export type DoguLicenseId = string;

export interface DoguLicenseBaseTraits {
  doguLicenseId: DoguLicenseId;
  licenseKey: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export type DoguLicenseBase = DoguLicenseBaseTraits;
export const DoguLicensePropCamel = propertiesOf<DoguLicenseBase>();
export const DoguLicensePropSnake = camelToSnakeCasePropertiesOf<DoguLicenseBase>();
