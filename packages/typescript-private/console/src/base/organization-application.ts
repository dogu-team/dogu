import { CREATOR_TYPE, OrganizationId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';

import { OrganizationBase, UserBase } from '..';

export type OrganizationApplicationWithIcon = OrganizationApplicationBase & { iconUrl: string };

export interface OrganizationApplicationRelationBaseTraits {
  creator?: UserBase;
  organization: OrganizationBase;
}
export interface OrganizationApplicationBaseTraits {
  organizationApplicationId: string;
  organizationId: OrganizationId;
  creatorId: UserId | null;
  creatorType: CREATOR_TYPE;
  isLatest: number;
  name: string;
  iconFileName: string | null;
  fileName: string;
  fileExtension: string;
  fileSize: number;
  package: string;
  version: string;
  versionCode: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OrganizationApplicationBase = OrganizationApplicationBaseTraits & OrganizationApplicationRelationBaseTraits;
export const OrganizationApplicationPropCamel = propertiesOf<OrganizationApplicationBase>();
export const OrganizationApplicationPropSnake = camelToSnakeCasePropertiesOf<OrganizationApplicationBase>();
