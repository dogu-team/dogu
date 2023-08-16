import { Architecture, HostId, OrganizationId } from '@dogu-tech/types';
import { TokenId } from '..';
import { PATH_MAX_LENGTH, PATH_MIN_LENGTH } from '../constants';
import { Platform } from '../protocol/generated/tsproto/outer/platform';
import { UserId } from '../user/types';

export const HOST_TABLE_NAME = 'host';

export interface Host {
  hostId: HostId;
  name: string;
  platform: Platform;
  architecture: Architecture;
  rootWorkspace: string;
  connectionState: HostConnectionState;
  deviceServerPort: number;
  heartbeat: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  creatorId: UserId;
  organizationId: OrganizationId;
  tokenId: TokenId;
  agentVersion: string | null;
}

/**
 * @note used by frontend input field validation and backend validation
 */
export const HOST_NAME_MIN_LENGTH = 1;
export const HOST_NAME_MAX_LENGTH = 50;

export const HOST_WORKSPACE_PATH_MIN_LENGTH = PATH_MIN_LENGTH;
export const HOST_WORKSPACE_PATH_MAX_LENGTH = PATH_MAX_LENGTH;

export enum HostConnectionState {
  /**
   * @note not used. for protobuf compatibility only
   */
  HOST_CONNECTION_STATE_UNSPECIFIED = 0,

  HOST_CONNECTION_STATE_DISCONNECTED = 1,
  HOST_CONNECTION_STATE_CONNECTED = 2,
}
