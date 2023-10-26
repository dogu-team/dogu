import { RegisterSelfHostedLicenseDto, SelfHostedLicenseBase } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '../../src/api';

import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../src/utils/auth';

export const registerSelfHostedLicense = async (dto: RegisterSelfHostedLicenseDto): Promise<any> => {
  const { data } = await api.post<SelfHostedLicenseBase>('/licenses', dto);
  return data;
};

export const getSelfHostedLicenseInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<SelfHostedLicenseBase>(`/licenses`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const license = response.data;
    return license;
  }

  throw new EmptyTokenError();
};
