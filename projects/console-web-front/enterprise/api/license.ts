import { FindLicenseDtoBase, LicenseResponse } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import api from '../../src/api';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../src/utils/auth';

export const registerSelfHostedLicense = async (dto: FindLicenseDtoBase): Promise<LicenseResponse> => {
  const { data } = await api.post<LicenseResponse>('/dogu-licenses', dto);
  return data;
};

export const reRegisterSelfHostedLicense = async (dto: FindLicenseDtoBase): Promise<LicenseResponse> => {
  const { data } = await api.patch<LicenseResponse>('/dogu-licenses', dto);
  return data;
};

export const getLicenseInServerSide = async (
  context: GetServerSidePropsContext,
  organizationId: OrganizationId | null,
) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    let data: AxiosResponse<LicenseResponse>;
    if (organizationId) {
      data = await api.get<LicenseResponse>(`/organizations/${organizationId}/dogu-licenses`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } else {
      data = await api.get<LicenseResponse>(`/dogu-licenses`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    }
    setCookiesInServerSide(data, context);

    const license = data.data;

    return license;
  }

  throw new EmptyTokenError();
};
