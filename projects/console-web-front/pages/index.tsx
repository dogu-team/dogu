import type { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { NextPageWithLayout } from './_app';
import { checkLoginInServerSide, redirectToLastAccessOrganization } from 'src/utils/auth';
import { redirectWithLocale } from '../src/ssr/locale';
import Cookies from 'universal-cookie';

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Box></Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  const user = await checkLoginInServerSide(context);

  if (user) {
    const lastOrgRedirect = redirectToLastAccessOrganization(user, context);

    if (lastOrgRedirect) {
      return lastOrgRedirect;
    }

    return {
      redirect: redirectWithLocale(context, '/account/organizations', false),
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
