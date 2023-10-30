import { CREATOR_TYPE, HostId, OrganizationId, ProjectId, SNS_TYPE, UserSnsId } from '..';
import { UserId } from '../user';

export interface UserAuthToken {
  accessToken: string;
  refreshToken: string;
}

export function isUserAuthToken(obj: any): obj is UserAuthToken {
  return (
    typeof obj === 'object' && //
    typeof obj.accessToken === 'string' &&
    typeof obj.refreshToken === 'string'
  );
}

export const USER_ACCESS_TOKEN_COOKIE_NAME = 'u_at';
export const USER_REFRESH_TOKEN_COOKIE_NAME = 'u_rt';
export const USER_ID_COOKIE_NAME = '_uid';

export const USER_ACCESS_TOKEN_EXPIRE_TIME = '10m';
export const USER_REFRESH_TOKEN_EXPIRE_TIME = 14; // 14 days

export const GOOGLE = 'google';

export type UserPayload = {
  userId: UserId;
};

export function isUserPayload(payload: any): payload is UserPayload {
  return (
    typeof payload === 'object' && //
    payload !== null &&
    'userId' in payload
  );
}

export type HostPayload = {
  hostId: HostId;
};

export function isHostPayload(payload: any): payload is HostPayload {
  return (
    typeof payload === 'object' && //
    payload !== null &&
    'hostId' in payload
  );
}

export interface OAuthPayLoad {
  userSnsId: UserSnsId;
  email: string;
  snsType: SNS_TYPE;
  name?: string;
}

export interface GoogleOAuthPayload extends OAuthPayLoad {}

export function isGoogleOAuthPayload(payload: any): payload is GoogleOAuthPayload {
  return (
    typeof payload === 'object' && //
    payload !== null &&
    'snsType' in payload &&
    payload.snsType === SNS_TYPE.GOOGLE &&
    'id' in payload &&
    'email' in payload &&
    typeof payload.email === 'string' &&
    'name' in payload &&
    typeof payload.name === 'string'
  );
}

export type AuthPayLoad = UserPayload | HostPayload | GoogleOAuthPayload;

export type RemotePayload = {
  userId?: UserId;
  projectId?: ProjectId;
  organizationId?: OrganizationId;
  creatorType: CREATOR_TYPE;
};

export function isRemotePayloadPayload(payload: any): payload is RemotePayload {
  return (
    typeof payload === 'object' && //
    payload !== null &&
    'creatorType' in payload &&
    ('userId' in payload || 'projectId' in payload || 'organizationId' in payload)
  );
}
