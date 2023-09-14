import {
  CreateAdminDtoBase,
  CreateInvitationMemberDtoBase,
  ResetPasswordWithTokenDtoBase,
  SignInDtoBase,
  UserBase,
} from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { GetServerSidePropsContext } from 'next';

import api from '.';
import { EmptyTokenError, getServersideCookies } from '../utils/auth';

interface Props {
  className?: string;
  email: string;
  organizationId: OrganizationId;
  token: string;
}

export interface SignUpBody extends CreateAdminDtoBase {}

export const signUp = async (signupBody: SignUpBody) => {
  const { data } = await api.post<{ organizationId: string }>('/registery/signup', signupBody);
  return data;
};

export interface InvitationSignUpBody extends CreateInvitationMemberDtoBase {}

export const signIn = async (signInDto: SignInDtoBase) => {
  const { data } = await api.post<{ lastAccessOrganizationId: string | null }>('/registery/signin', signInDto);
  return data;
};

export const signOut = async () => {
  await api.post<void>('registery/signout');
};

export const getMyData = async (token: any) => {
  const response = await api.get<UserBase>('/registery/check', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
};

export const hasSameEmailUser = async (email: string) => {
  return await api.head(`/registery/user?email=${email}`);
};

export const verifyEmail = async (email: string, token: string) => {
  // TODO
  return await api.post(`/registery/verification/`, { token, email });
};

export const sendVerifyEmail = async (email: string) => {
  // TODO
  return await api.get(`/registery/verification?email=${email}`);
};

export const sendResetPasswordEmail = async (email: string) => {
  return await api.post(`/registery/password/${email}`);
};

export const checkResetPasswordEmailAndToken = async (email: string, token: string) => {
  return await api.head(`/registery/password?email=${email}&token=${token}`);
};

export const resetPasswordWithToken = async (resetPasswordWithTokenBody: ResetPasswordWithTokenDtoBase) => {
  return await api.post(`/registery/password`, resetPasswordWithTokenBody);
};

export const getUserInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const { data } = await getMyData(authToken);
    return data;
  }

  throw new EmptyTokenError();
};
