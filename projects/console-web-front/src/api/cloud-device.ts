import { DeviceBase } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '.';
import { EmptyTokenError, getServersideCookies } from '../utils/auth';

export const getCloudDeviceByIdInServerSide = async (context: GetServerSidePropsContext, deviceId: string) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    try {
      const response = await api.get<DeviceBase>(`/cloud-devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return response.data;
    } catch (e) {
      return null;
    }
  }

  throw new EmptyTokenError();
};
