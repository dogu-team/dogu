import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

export interface OrganizationKeyBaseTraits {
  organizationKeyId: string;
  organizationId: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationKeyBase = OrganizationKeyBaseTraits;
export const OrganizationKeyPropCamel = propertiesOf<OrganizationKeyBase>();
export const OrganizationKeyPropSnake = camelToSnakeCasePropertiesOf<OrganizationKeyBase>();
