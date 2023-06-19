import { RepositoryFileMetaTree } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from 'src/api';
import { getServersideCookies } from 'src/utils/auth';

export const getProjectFolderTreeInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  const { data } = await api.get<RepositoryFileMetaTree>(`/organizations/${context.query.orgId}/projects/${context.query.pid}/folder`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  return data;
};
