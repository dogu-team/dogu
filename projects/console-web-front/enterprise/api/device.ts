import {
  DeviceBase,
  EnableDeviceDtoBase,
  GetEnabledDeviceCountResponse,
  UpdateDeviceMaxParallelJobsDtoBase,
} from '@dogu-private/console';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { AxiosError } from 'axios';
import useSWR, { SWRResponse } from 'swr';

import api, { swrAuthFetcher } from '../../src/api';

export const enableDevice = async (
  organizationId: OrganizationId,
  deviceId: DeviceId,
  body: EnableDeviceDtoBase,
): Promise<void> => {
  await api.post<void>(`/organizations/${organizationId}/devices/${deviceId}/enable`, body);
  return;
};

export const useDeviceCount = (): SWRResponse<GetEnabledDeviceCountResponse, AxiosError> => {
  const rv = useSWR<GetEnabledDeviceCountResponse>(
    process.env.NEXT_PUBLIC_ENV === 'self-hosted' && `/devices/count`,
    swrAuthFetcher,
  );
  return rv;
};

export const updateDeviceMaxParallelCount = async (
  orgId: OrganizationId,
  deviceId: DeviceId,
  dto: UpdateDeviceMaxParallelJobsDtoBase,
): Promise<DeviceBase> => {
  const { data } = await api.patch<DeviceBase>(`/organizations/${orgId}/devices/${deviceId}/max-parallel-job`, dto);
  return data;
};
