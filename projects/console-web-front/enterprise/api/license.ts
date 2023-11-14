import { CloudLicenseResponse, RegisterSelfHostedLicenseDto, SelfHostedLicenseResponse } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '../../src/api';

import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../src/utils/auth';

export const registerSelfHostedLicense = async (dto: RegisterSelfHostedLicenseDto): Promise<any> => {
  const { data } = await api.post<SelfHostedLicenseResponse>('/self-hosted-licenses', dto);
  return data;
};

export const getSelfHostedLicenseInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<SelfHostedLicenseResponse>(`/self-hosted-licenses`, {
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

export const getLicenseInServerSide = async (context: GetServerSidePropsContext) => {
  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return await getSelfHostedLicenseInServerSide(context);
  } else {
    return await getCloudLicenseInServerSide(context);
  }
};
