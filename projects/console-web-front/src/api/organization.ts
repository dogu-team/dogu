import {
  CreateOrganizationDtoBase,
  InviteEmailDtoBase,
  OrganizationBase,
  UpdateOrganizationDtoBase,
  UpdateOrganizationOwnerDtoBase,
  UpdateOrganizationRoleDtoBase,
  UserBase,
} from '@dogu-private/console';
import { OrganizationId, UserId } from '@dogu-private/types';
import { AxiosProgressEvent } from 'axios';
import { GetServerSidePropsContext } from 'next';

import api from 'src/api';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from 'src/utils/auth';

export const updateOrganization = async (organizationId: OrganizationId, updatedData: UpdateOrganizationDtoBase) => {
  const { data } = await api.patch<OrganizationBase>(`/organizations/${organizationId}`, updatedData);

  return data;
};

export const uploadOrganizationImage = async (organizationId: OrganizationId, file: File, progress?: (e: AxiosProgressEvent) => void) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post<OrganizationBase>(`/organizations/${organizationId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progress,
  });

  return data;
};

export const getOrganizationInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const data = await api.get<OrganizationBase>(`/organizations/${context.query.orgId}`, { headers: { Authorization: `Bearer ${authToken}` } });
    setCookiesInServerSide(data, context);

    const organization = data.data;

    return organization;
  }

  throw new EmptyTokenError();
};

export const createOrganization = async (dto: CreateOrganizationDtoBase) => {
  const { data } = await api.post<OrganizationBase>(`/organizations`, dto);

  return data;
};

export const removeOrganization = async (organizationId: OrganizationId) => {
  return await api.delete<void>(`/organizations/${organizationId}`);
};

export const updateOrganizationOwner = async (orgId: OrganizationId, userId: UserId) => {
  const dto: UpdateOrganizationOwnerDtoBase = {
    userId,
  };

  return await api.patch<void>(`/organizations/${orgId}/owner`, dto);
};

export const getOrganizationPublic = async (orgId: OrganizationId) => {
  const { data } = await api.get<OrganizationBase>(`/organizations/${orgId}/public`);
  return data;
};

export const updateUserOrgPermission = async (organizationId: OrganizationId, userId: UserId, updateRoleDtoBase: UpdateOrganizationRoleDtoBase) => {
  const data = await api.patch<UserBase>(`/organizations/${organizationId}/users/${userId}/role`, updateRoleDtoBase);

  return data.data;
};

export const deleteOrganizationMember = async (organizationId: OrganizationId, userId: UserId) => {
  const data = await api.delete(`/organizations/${organizationId}/users/${userId}`);

  return data.data;
};

export const inviteUsers = async (orgId: OrganizationId, dto: InviteEmailDtoBase) => {
  return await api.post(`/organizations/${orgId}/invitations/emails`, dto);
};

export const cancelInvitation = async (orgId: OrganizationId, email: string) => {
  return await api.delete(`/organizations/${orgId}/invitations/emails/${email}`);
};

export const getOrganizationAccessToken = async (orgId: OrganizationId) => {
  const { data } = await api.get<string>(`/organizations/${orgId}/access-token`);
  return data;
};

export const regenerateOrganizationAccessToken = async (orgId: OrganizationId) => {
  const { data } = await api.post<string>(`/organizations/${orgId}/access-token`);
  return data;
};
