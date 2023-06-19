import { OrganizationId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from './organization';
import { UserBase } from './user';

export interface UserVisitRelationTraits {
  organization?: OrganizationBase;
  user?: UserBase;
  // project?: ProjectBase;
}

export interface UserVisitBaseTraits {
  userId: UserId;
  organizationId: OrganizationId;
  // projectId: ProjectId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserVisitBase = UserVisitBaseTraits & UserVisitRelationTraits;
export const UserVisitPropCamel = propertiesOf<UserVisitBase>();
export const UserVisitPropSnake = camelToSnakeCasePropertiesOf<UserVisitBase>();
