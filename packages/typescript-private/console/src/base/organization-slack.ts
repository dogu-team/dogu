import { OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';

export interface OrganizationSlackBaseTraits {
  organizationId: OrganizationId;
  authedUserId: string;
  scope: string;
  accessToken: string;
  botUserId: string;
  teamId: string;
  teamName: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface OrganizationSlackRelationTraits {
  organization?: OrganizationBase;
}

export type OrganizationSlackBase = OrganizationSlackBaseTraits & OrganizationSlackRelationTraits;
export const OrganizationSlackPropCamel = propertiesOf<OrganizationSlackBaseTraits>();
export const OrganizationSlackPropSnake = camelToSnakeCasePropertiesOf<OrganizationSlackBase>();
