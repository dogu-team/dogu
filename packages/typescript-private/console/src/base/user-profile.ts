// import { camelToSnakeCasePropertiesOf, OrganizationId, propertiesOf, UserId } from '@dogu-private/types';
// import { OrganizationBase } from './organization';
// import { UserBase } from './user';

// export interface UserProfileRelationTraits {
//   user?: UserBase;
//   organization?: OrganizationBase;
// }

// export interface UserProfileBaseTraits {
//   userId: UserId;
//   organizationId: OrganizationId;
//   profileImageUrl: string | null;
//   name: string;
//   lastAccessedAt: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt: Date | null;
// }

// export type UserProfileBase = UserProfileBaseTraits & UserProfileRelationTraits;
// export const UserProfilePropCamel = propertiesOf<UserProfileBase>();
// export const UserProfilePropSnake = camelToSnakeCasePropertiesOf<UserProfileBase>();
