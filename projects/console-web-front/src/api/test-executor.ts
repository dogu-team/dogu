import { CreateWebResponsiveDtoBase, TestExecutorWebResponsiveSnapshots } from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '.';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../utils/auth';

export const createWebResponsive = async (dto: CreateWebResponsiveDtoBase) => {
  await api.post<void>(`/test-executor/web-responsive/create`, dto);
};

export const getWebResponsiveSnapshotsServerSide = async (
  context: GetServerSidePropsContext,
  organizationId: string,
  testExecutorId: string,
) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<TestExecutorWebResponsiveSnapshots>(`/test-executor/web-responsive/snapshot`, {
      params: { organizationId, testExecutorId },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const snapshots = response.data;
    return snapshots;
  }
};

export const getWebResponsiveListServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get(`/test-executor/web-responsive/list`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const webResponsiveList = response.data;
    return webResponsiveList;
  }

  throw new EmptyTokenError();
};
