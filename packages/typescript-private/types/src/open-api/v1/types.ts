import { OrganizationId, ProjectId } from '@dogu-tech/types';
import { UserId } from '../../user';

export enum V1CALLER_TYPE {
  ORGANIZATION,
  PROJECT,
  USER,
}

export type V1OpenApiPayload = {
  userId?: UserId;
  projectId?: ProjectId;
  organizationId?: OrganizationId;
  callerType: V1CALLER_TYPE;
};

export function isOpenApiPayload(payload: any): payload is V1OpenApiPayload {
  return (
    typeof payload === 'object' && //
    payload !== null &&
    'callerType' in payload &&
    ('userId' in payload || 'projectId' in payload || 'organizationId' in payload)
  );
}
