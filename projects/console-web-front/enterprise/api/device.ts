import { EnableDeviceDtoBase } from '@dogu-private/console';
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

export const useDeviceCount = (): SWRResponse<number, AxiosError> => {
  const rv = useSWR<number>(process.env.NEXT_PUBLIC_ENV === 'self-hosted' && `/devices/count`, swrAuthFetcher);
  return rv;
};
