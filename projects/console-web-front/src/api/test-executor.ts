import {
  CreateWebResponsiveDtoBase,
  getWebResponsiveListDtoBase,
  GetWebResponsiveSnapshotsDtoBase,
  TestExecutorBase,
  TestExecutorWebResponsiveSnapshotMap,
} from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '.';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../utils/auth';

export const createWebResponsiveSnapshots = async (dto: CreateWebResponsiveDtoBase) => {
  await api.post<void>(`/test-executor/web-responsive/create`, dto);
};

export const getWebResponsiveListServerSide = async (
  context: GetServerSidePropsContext,
  dto: getWebResponsiveListDtoBase,
) => {
  const { organizationId } = dto;
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<TestExecutorBase[]>(`/test-executor/web-responsive/list`, {
      params: { organizationId },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const webResponsiveList = response.data;
    return webResponsiveList;
  }

  throw new EmptyTokenError();
};

export const getWebResponsiveSnapshotsServerSide = async (
  context: GetServerSidePropsContext,
  dto: GetWebResponsiveSnapshotsDtoBase,
) => {
  const { organizationId, testExecutorId } = dto;
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const response = await api.get<TestExecutorWebResponsiveSnapshotMap>(`/test-executor/web-responsive/snapshot`, {
      params: { organizationId, testExecutorId },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    setCookiesInServerSide(response, context);
    const snapshots = response.data;
    return snapshots;
  }
};
