import { FeatureTableBase } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '../../api';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../utils/auth';

export const getFeatureConfigInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const data = await api.get<FeatureTableBase>(`/feature`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setCookiesInServerSide(data, context);

    const feature = data.data;

    return feature;
  }

  throw new EmptyTokenError();
};
