import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import Cookies from 'universal-cookie';

import SignUpForm from 'src/components/registery/SignUpForm';
import { checkLoginInServerSide, redirectToLastAccessOrganization } from 'src/utils/auth';
import { NextPageWithLayout } from 'pages/_app';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import ServiceAgreement from 'src/components/registery/ServiceAgreement';
import { signUp } from '../../src/api/registery';
import { sendErrorNotification } from '../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../src/utils/error';
import SocialSignInForm from '../../src/components/social-signin/SocialSignInForm';
import { redirectWithLocale } from '../../src/ssr/locale';
import { hasRootUser } from '../../src/api/feature';
import usePromotionStore from '../../src/stores/promotion';

interface Props {
  shouldSetupRoot: boolean;
}

const SignUpPage: NextPageWithLayout<Props> = ({ shouldSetupRoot }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const resetPromotion = usePromotionStore((state) => state.resetWithOrganizationId);

  const handleSignUp = useCallback(async (email: string, name: string, password: string, newsletter: boolean) => {
    try {
      const { organizationId } = await signUp({
        email,
        name,
        password,
        newsletter: newsletter ?? false,
      });
      resetPromotion(organizationId);
      const cookies = new Cookies();
      cookies.set('newOrgId', organizationId, { path: '/' });
      router.push('/auth/entry');
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          sendErrorNotification(t('registery:signUpAlreadyExistEmailErrorMsg'));
        } else {
          sendErrorNotification(t('registery:signUpFailedErrorMsg', { reason: getErrorMessageFromAxios(e) }));
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
        {!shouldSetupRoot && (
          <AccountText>
            <Trans
              i18nKey="registery:signUpAlreadyAccountExist"
              components={[<StyledLink key="signin" href={`/signin`} />]}
            />
          </AccountText>
        )}
        {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && <SocialSignInForm />}
      </Box>
    </>
  );
};

SignUpPage.getLayout = function (page) {
  return (
    <SmallBoxCenteredLayout
      titleI18nKey={page.props.shouldSetupRoot ? 'registery:signUpRootPageTitle' : 'registery:signUpPageTitle'}
    >
      {page}
    </SmallBoxCenteredLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  let shouldSetupRoot = false;

  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    try {
      shouldSetupRoot = !(await hasRootUser());
    } catch (e) {}
  }

  if (shouldSetupRoot) {
    return {
      props: {
        shouldSetupRoot,
      },
    };
  }

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
    props: {
      shouldSetupRoot,
    },
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
