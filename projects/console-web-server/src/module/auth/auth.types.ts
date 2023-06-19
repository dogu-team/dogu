// user jwt key
export const USER_JWT_GUARD_KEY = 'USER_JWT_GUARD';

// organization role type
export const ORGANIZATION_ROLE_KEY = 'ORGANIZATION_ROLE';
export enum ORGANIZATION_ROLE {
  OWNER = 1,
  ADMIN = 2,
  MEMBER = 3,
}
export function checkOrganizationRolePermission(checkOrgRoleType: ORGANIZATION_ROLE, requiredOrgRoleType: ORGANIZATION_ROLE): boolean {
  return checkOrgRoleType <= requiredOrgRoleType;
}

// project role type
export const PROJECT_ROLE_KEY = 'PROJECT_ROLE';
export enum PROJECT_ROLE {
  ADMIN = 1,
  WRITE = 2,
  READ = 3,
}
export function checkProjectRolePermission(checkProjectRoleType: PROJECT_ROLE, requiredProjectRoleType: PROJECT_ROLE): boolean {
  return checkProjectRoleType <= requiredProjectRoleType;
}

// email verification type
export const EMAIL_VERIFICATION_KEY = 'EMAIL_VERIFICATION';
export enum EMAIL_VERIFICATION {
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
}

// host role type
export const HOST_ACTION_KEY = 'HOST_ROLE';
export enum HOST_ACTION_TYPE {
  CREATE_HOST_API = 'CREATE_HOST_API',
  CREATE_DEVICE_API = 'CREATE_DEVICE_API',
  HOST_API = 'HOST_API',
  DEVICE_API = 'DEVICE_API',
  PROJECT_ACTION_API = 'PROJECT_ACTION_API',
}
