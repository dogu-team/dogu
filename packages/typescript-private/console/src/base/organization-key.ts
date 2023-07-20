import { OrganizationId, OrganizationKeyId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';

interface OrganizationKeyRelationTraits {
  organization?: OrganizationBase;
}
export interface OrganizationKeyBaseTraits {
  organizationKeyId: OrganizationKeyId;
  organizationId: OrganizationId;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationKeyBase = OrganizationKeyBaseTraits & OrganizationKeyRelationTraits;
export const OrganizationKeyPropCamel = propertiesOf<OrganizationKeyBase>();
export const OrganizationKeyPropSnake = camelToSnakeCasePropertiesOf<OrganizationKeyBase>();
