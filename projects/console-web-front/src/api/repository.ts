import { RepositoryFileMetaTree, RepositoryFileTree, RepositoryRawFile } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { GetServerSidePropsContext } from 'next';

import api from 'src/api';
import { getServersideCookies, setCookiesInServerSide } from 'src/utils/auth';

export const getFile = async (organizationId: OrganizationId, projectId: ProjectId, filePath: string) => {
  const response = await api.get<RepositoryRawFile>(`/organizations/${organizationId}/projects/${projectId}/repository/file?path=${filePath}`);

  return response.data;
};

export const getScriptFileMetaTreeInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  const response = await api.get<RepositoryFileMetaTree>(`/organizations/${context.query.orgId}/projects/${context.query.pid}/repository/scripts`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  setCookiesInServerSide(response, context);

  return response.data;
};

export const getProjectRepositoryFileTreeInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  const response = await api.get<RepositoryFileTree>(`/organizations/${context.query.orgId}/projects/${context.query.pid}/repository/tree`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  setCookiesInServerSide(response, context);

  return response.data;
};

export const getProjectRepositoryFileMetaTreeInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  const response = await api.get<RepositoryFileMetaTree[]>(`/organizations/${context.query.orgId}/projects/${context.query.pid}/files`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  setCookiesInServerSide(response, context);

  return response.data;
};
