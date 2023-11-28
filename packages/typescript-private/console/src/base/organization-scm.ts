import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

import { OrganizationBase } from './organization';

export const OrganizationScmType = ['git'] as const;
export type OrganizationScmType = (typeof OrganizationScmType)[number];

export const OrganizationScmServiceType = ['github', 'bitbucket', 'gitlab'] as const;
export type OrganizationScmServiceType = (typeof OrganizationScmServiceType)[number];

export interface OrganizationScmBaseTraits {
  organizationScmId: string;
  organizationId: OrganizationId;
  type: OrganizationScmType;
  serviceType: OrganizationScmServiceType;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface OrganizationScmRelationTraits {
  organization?: OrganizationBase;
}

export type OrganizationScmBase = OrganizationScmBaseTraits & OrganizationScmRelationTraits;
export const OrganizationScmPropCamel = propertiesOf<OrganizationScmBase>();
export const OrganizationScmPropSnake = camelToSnakeCasePropertiesOf<OrganizationScmBase>();
