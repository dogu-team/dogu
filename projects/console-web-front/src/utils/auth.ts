import { UserBase } from '@dogu-private/console';
import {
  UserAuthToken,
  USER_ACCESS_TOKEN_COOKIE_NAME,
  USER_ID_COOKIE_NAME,
  USER_REFRESH_TOKEN_COOKIE_NAME,
  USER_VERIFICATION_STATUS,
} from '@dogu-private/types';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';
import Cookies from 'universal-cookie';

import { getMyData } from 'src/api/registery';
import { redirectWithLocale } from '../ssr/locale';
import { ORGANIZATION_ROLE } from '../types/organization';

export const checkLoginInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    try {
      const response = await getMyData(authToken);
      setCookiesInServerSide(response, context);

      return response.data;
    } catch (e) {
      return null;
    }
  }

  return null;
};

export const checkUserVerifiedInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);
  const signInRedirect = redirectWithLocale(context, `/signin?redirect=${context.resolvedUrl}`, false);

  if (authToken) {
    try {
      const response = await getMyData(authToken);
      setCookiesInServerSide(response, context);

      /**
       * @Note For dev, prod only
       */
      if (process.env.NEXT_PUBLIC_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'production') {
        if (response.data.userAndVerificationToken?.status === USER_VERIFICATION_STATUS.PENDING) {
          return {
            redirect: redirectWithLocale(context, `/auth/entry?redirect=${context.resolvedUrl}`, false),
          };
        }
      }

      return {
        props: {
          fallback: {
            '/registery/check': response.data,
          },
        },
      };
    } catch (e) {
      return {
        redirect: signInRedirect,
      };
    }
  }

  return {
    redirect: signInRedirect,
  };
};

export const redirectToLastAccessOrganization = (user: UserBase, context: GetServerSidePropsContext) => {
  if (user.organizationAndUserAndOrganizationRoles && user.organizationAndUserAndOrganizationRoles.length > 0) {
    return {
      redirect: redirectWithLocale(
        context,
        `/dashboard/${user.organizationAndUserAndOrganizationRoles[0].organizationId}`,
        false,
      ),
    };
  }

  return null;
};

export const getServersideCookies = (initCookie?: string | object | null) => {
  const cookies = new Cookies(initCookie);
  const accessToken: string | null = cookies.get(USER_ACCESS_TOKEN_COOKIE_NAME) ?? null;
  const refreshToken: string | null = cookies.get(USER_REFRESH_TOKEN_COOKIE_NAME) ?? null;
  const userId: string | null = cookies.get(USER_ID_COOKIE_NAME) ?? null;

  const jwtData: UserAuthToken = {
    accessToken: accessToken ?? '',
    refreshToken: refreshToken ?? '',
  };

  const authToken: string | null = !!accessToken && !!refreshToken ? JSON.stringify(jwtData) : null;

  return { accessToken, refreshToken, userId, authToken };
};

export const setCookiesInServerSide = (res: AxiosResponse, context: GetServerSidePropsContext) => {
  if (!res.headers['set-cookie']) {
    return;
  }

  context.res.setHeader('Set-Cookie', res.headers['set-cookie']);
};

export const removeTokenCookie = () => {
  const cookies = new Cookies();
  cookies.remove(USER_ACCESS_TOKEN_COOKIE_NAME, { path: '/' });
};

export class EmptyTokenError extends Error {
  constructor() {
    super('Not Authorized');
  }
}

export const hasAdminPermission = (user: UserBase) => {
  return (
    user.organizationAndUserAndOrganizationRoles &&
    user.organizationAndUserAndOrganizationRoles[0].organizationRoleId <= ORGANIZATION_ROLE.ADMIN
  );
};
