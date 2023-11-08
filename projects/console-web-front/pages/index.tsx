import type { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Cookies from 'universal-cookie';

import { NextPageWithLayout } from './_app';
import {
  checkLoginInServerSide,
  checkUserVerifiedInServerSide,
  redirectToLastAccessOrganization,
} from 'src/utils/auth';
import { redirectWithLocale } from '../src/ssr/locale';
import { hasRootUser } from '../src/api/feature';

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Box></Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let shouldSetupRoot = false;

  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    try {
      shouldSetupRoot = !(await hasRootUser());
    } catch (e) {}
  }

  if (shouldSetupRoot) {
    return {
      redirect: {
        destination: '/signup',
        permanent: false,
      },
    };
  }

  const cookies = new Cookies(context.req.cookies);
  const redirectUrl = cookies.get('redirectUrl');

  if (redirectUrl) {
    context.res.setHeader('set-cookie', [`redirectUrl=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`]);

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  }

  const checkResult = await checkUserVerifiedInServerSide(context);

  if (checkResult.redirect) {
    return checkResult;
  }

  const user = checkResult.props.fallback['/registery/check'];

  if (user) {
    const lastOrgRedirect = redirectToLastAccessOrganization(user, context);

    if (lastOrgRedirect) {
      return lastOrgRedirect;
    }

    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }

  return {
    redirect: redirectWithLocale(context, '/signin', false),
  };
};

export default Home;

const Box = styled.div`
  display: flex;
  width: 100%;
  min-height: calc(100vh - 300px);
  flex-direction: column;
`;
