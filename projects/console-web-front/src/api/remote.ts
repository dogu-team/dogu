import { RemoteBase } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';
import api from '.';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../utils/auth';

export const getRemoteInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const data = await api.get<RemoteBase>(
      `/organizations/${context.query.orgId}/projects/${context.query.pid}/remotes/${context.query.remoteId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    setCookiesInServerSide(data, context);

    const rv = data.data;

    return rv;
  }

  throw new EmptyTokenError();
};
