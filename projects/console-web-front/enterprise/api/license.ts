import {} from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { GetServerSidePropsContext } from 'next';

import { EmptyTokenError, getServersideCookies } from '../../src/utils/auth';

export const registerSelfHostedLicense = async (dto: any): Promise<any> => {
  // const { data } = await api.post<LicenseResponse>('/dogu-licenses', dto);
  // return data;
  throw new Error('Not implemented');
};

export const reRegisterSelfHostedLicense = async (dto: any): Promise<any> => {
  // const { data } = await api.patch<LicenseResponse>('/dogu-licenses', dto);
  // return data;
  throw new Error('Not implemented');
};

export const getLicenseInServerSide = async (
  context: GetServerSidePropsContext,
  organizationId: OrganizationId | null,
) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    // let data: AxiosResponse<LicenseResponse>;
    // if (organizationId) {
    //   data = await api.get<LicenseResponse>(`/organizations/${organizationId}/dogu-licenses`, {
    //     headers: { Authorization: `Bearer ${authToken}` },
    //   });
    // } else {
    //   data = await api.get<LicenseResponse>(`/dogu-licenses`, {
    //     headers: { Authorization: `Bearer ${authToken}` },
    //   });
    // }
    // setCookiesInServerSide(data, context);
    // const license = data.data;
    // return license;
  }

  throw new EmptyTokenError();
};
