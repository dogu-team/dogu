import { DeviceId, LiveSessionId, LiveSessionState, OrganizationId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase, OrganizationBase } from '..';

interface LiveSessionRelationTraits {
  organization?: OrganizationBase;
  device?: DeviceBase;
}

export interface LiveSessionBase extends LiveSessionRelationTraits {
  liveSessionId: LiveSessionId;
  /**
   * @description requested organization
   */
  organizationId: OrganizationId;
  /**
   * @description acquired device
   */
  deviceId: DeviceId;
  state: LiveSessionState;
  heartbeat: Date | null;
  closeWaitAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const LiveSessionPropCamel = propertiesOf<LiveSessionBase>();
export const LiveSessionPropSnake = camelToSnakeCasePropertiesOf<LiveSessionBase>();
