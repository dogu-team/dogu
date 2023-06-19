import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';

import { getInvitationServerSide } from '../api/invitation';
import { checkLoginInServerSide, getServersideCookies } from '../utils/auth';
import { redirectWithLocale } from './locale';

export const getInvitationServerSideProps: GetServerSideProps = async (context) => {
  const { organizationId, email, token } = context.query;
  const redirectMain = {
    redirect: redirectWithLocale(context, '/', false),
  };

  if (!organizationId || !email || !token) {
    return redirectMain;
  }

  try {
    const me = await checkLoginInServerSide(context);

    if (me) {
      return {
        redirect: redirectWithLocale(context, `/auth/invite-confirm?email=${email}&organizationId=${organizationId}&token=${token}`, false),
      };
    }
  } catch (e) {
    return {
      redirect: redirectWithLocale(context, `/`, false),
    };
  }

  try {
    const { authToken } = getServersideCookies(context.req.cookies);
    const invitation = await getInvitationServerSide(email as string, organizationId as OrganizationId, token as string, authToken ?? '');

    return {
      props: {
        email,
        token,
        invitation,
      },
    };
  } catch (e) {
    return redirectMain;
  }
};
