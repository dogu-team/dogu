import { CloudLicenseResponse, RegisterSelfHostedLicenseDto, SelfHostedLicenseBase } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '../../src/api';

import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../src/utils/auth';

export const registerSelfHostedLicense = async (dto: RegisterSelfHostedLicenseDto): Promise<any> => {
  const { data } = await api.post<SelfHostedLicenseBase>('/self-hosted-licenses', dto);
  return data;
};

export const getSelfHostedLicenseInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<SelfHostedLicenseBase>(`/self-hosted-licenses`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const license = response.data;
    return license;
  }

  throw new EmptyTokenError();
};

export const getCloudLicenseInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<CloudLicenseResponse>(`/cloud-licenses`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const license = response.data;
    return license;
  }

  throw new EmptyTokenError();
};
