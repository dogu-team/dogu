import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

import SignUpForm from 'src/components/registery/SignUpForm';
import { checkLoginInServerSide, redirectToLastAccessOrganization } from 'src/utils/auth';
import { NextPageWithLayout } from 'pages/_app';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import ServiceAgreement from 'src/components/registery/ServiceAgreement';
import { signUp } from '../../src/api/registery';
import { sendErrorNotification } from '../../src/utils/antd';
import { getErrorMessage } from '../../src/utils/error';
import SocialSignInForm from '../../src/components/social-signin/SocialSignInForm';
import { redirectWithLocale } from '../../src/ssr/locale';

const SignUpPage: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSignUp = useCallback(async (email: string, name: string, password: string, newsletter: boolean) => {
    try {
      await signUp({ email, name, password, newsletter: newsletter ?? false });
      router.push('/auth/entry');
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          sendErrorNotification(t('registery:signUpAlreadyExistEmailErrorMsg'));
        } else {
          sendErrorNotification(t('registery:signUpFailedErrorMsg', { reason: getErrorMessage(e) }));
        }
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Sign up | Dogu</title>
      </Head>
      <Box>
        <StyledSignUpForm onSubmit={handleSignUp} />
        <ServiceAgreement />
        <AccountText>
          <Trans i18nKey="registery:signUpAlreadyAccountExist" components={[<StyledLink key="signin" href={`/signin`} />]} />
        </AccountText>
        {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && <SocialSignInForm />}
      </Box>
    </>
  );
};

SignUpPage.getLayout = function (page) {
  return <SmallBoxCenteredLayout titleI18nKey="registery:signUpPageTitle">{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const me = await checkLoginInServerSide(context);

  if (me) {
    const lastOrgRedirect = redirectToLastAccessOrganization(me, context);

    if (lastOrgRedirect) {
      return lastOrgRedirect;
    }

    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }

  return {
    props: {},
  };
};

export default SignUpPage;

const Box = styled.div``;

const StyledSignUpForm = styled(SignUpForm)`
  margin: 2.5rem 0 1rem;
`;

const AccountText = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.colors.link};
`;
