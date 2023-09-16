import {
  ResetPasswordDtoBase,
  UpdateLastOrganizationDtoBase,
  UpdateTutorialDtoBase,
  UpdateUserDtoBase,
  UpdateUserEmailPreferenceDtoBase,
  UserBase,
} from '@dogu-private/console';
import { OrganizationId, UserId } from '@dogu-private/types';
import { AxiosProgressEvent } from 'axios';
import { GetServerSidePropsContext } from 'next';

import api from '.';
import { getServersideCookies, setCookiesInServerSide } from '../utils/auth';

export const updateUser = async (userId: UserId, updateUserBody: UpdateUserDtoBase) => {
  const { data } = await api.patch<UserBase>(`/users/${userId}`, updateUserBody);

  return data;
};

export const updateProfileImage = async (userId: UserId, file: File, progress?: (e: AxiosProgressEvent) => void) => {
  const fd = new FormData();
  fd.append('image', file);

  const { data } = await api.post<UserBase>(`/users/${userId}/image`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progress,
  });

  return data;
};

export const resetPassword = async (userId: UserId, resetPasswordBody: ResetPasswordDtoBase) => {
  const { data } = await api.patch<boolean>(`/users/${userId}/password`, resetPasswordBody);

  return data;
};

export const updateLastAccessOrganization = async (orgId: OrganizationId) => {
  const dto: UpdateLastOrganizationDtoBase = {
    organizationId: orgId,
  };

  await api.patch<void>(`/users/record/last-organization`, dto);
};

export const leaveOrgization = async (userId: UserId, organizationId: OrganizationId) => {
  await api.delete<void>(`/users/${userId}/organizations/${organizationId}`);

  return;
};

export const deleteUser = async (userId: UserId) => {
  await api.delete<void>(`/users/${userId}`);

  return;
};

export const getUserById = async (userId: UserId) => {
  const { data } = await api.get<UserBase>(`/users/${userId}`);

  return data;
};

export const getUserByIdInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken, userId } = getServersideCookies(context.req.cookies);

  const response = await api.get<UserBase>(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  setCookiesInServerSide(response, context);

  return response.data;
};

export const updateUserEmailPreference = async (userId: UserId, dto: UpdateUserEmailPreferenceDtoBase) => {
  const { data } = await api.patch<UserBase>(`/users/${userId}/email-preference`, dto);

  return data;
};

export const updateUserTutorial = async (userId: UserId, dto: UpdateTutorialDtoBase) => {
  return await api.patch<void>(`/users/${userId}/tutorial`, dto);
};

export const getPersonalAccessToken = async (userId: UserId) => {
  const { data } = await api.get<string>(`/users/${userId}/access-token`);
  return data;
};

export const regeneratePersonalAccessToken = async (userId: UserId) => {
  const { data } = await api.post<string>(`/users/${userId}/access-token`);
  return data;
};
