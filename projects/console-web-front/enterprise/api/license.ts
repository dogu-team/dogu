import { FindLicenseDtoBase, LicenseBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import api from '../../src/api';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../src/utils/auth';

export const registerSelfHostedLicense = async (dto: FindLicenseDtoBase): Promise<LicenseBase> => {
  const { data } = await api.post<LicenseBase>('/dogu-licenses', dto);
  return data;
};

export const reRegisterSelfHostedLicense = async (dto: FindLicenseDtoBase): Promise<LicenseBase> => {
  const { data } = await api.patch<LicenseBase>('/dogu-licenses', dto);
  return data;
};

export const getLicenseInServerSide = async (
  context: GetServerSidePropsContext,
  organizationId: OrganizationId | null,
) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    let data: AxiosResponse<LicenseBase>;
    if (organizationId) {
      data = await api.get<LicenseBase>(`/organizations/${organizationId}/dogu-licenses`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } else {
      data = await api.get<LicenseBase>(`/dogu-licenses`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    }
    setCookiesInServerSide(data, context);

    const license = data.data;

    return license;
  }

  throw new EmptyTokenError();
};
