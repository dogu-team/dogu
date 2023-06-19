import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Link from 'next/link';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import SignInForm from 'src/components/registery/SignInForm';
import { checkLoginInServerSide, redirectToLastAccessOrganization } from 'src/utils/auth';
import { NextPageWithLayout } from 'pages/_app';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import SocialSignInForm from 'src/components/social-signin/SocialSignInForm';
import { redirectWithLocale } from 'src/ssr/locale';

const LoginPage: NextPageWithLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Sign in | Dogu</title>
      </Head>
      <Box>
        <FormBox>
          <SignInForm />
        </FormBox>
        <LinkWrapper>
          <FlexBox>
            <StyledLink href="/signin/forgot">{t('registery:signInForgotPasswordLinkText')}</StyledLink>
            <p>&nbsp;{t('registery:orText')}&nbsp;</p>
            <StyledLink access-id="sign-up-btn" href="/signup">
              {t('registery:signInSignUpLinkText')}
            </StyledLink>
          </FlexBox>
        </LinkWrapper>
        {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && <SocialSignInForm />}
      </Box>
    </>
  );
};

LoginPage.getLayout = function (page) {
  return <SmallBoxCenteredLayout titleI18nKey="registery:signInPageTitle">{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const me = await checkLoginInServerSide(context);

  if (me) {
    const lastOrgRedirect = redirectToLastAccessOrganization(me, context);

    if (lastOrgRedirect) {
      return lastOrgRedirect;
    }

    return {
      redirect: redirectWithLocale(context, '/account/organizations', false),
    };
  }

  return {
    props: {},
  };
};

export default LoginPage;

const Box = styled.div``;

const LinkWrapper = styled.div`
  font-size: 14px;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.colors.primary};
`;

const FlexBox = styled.div`
  display: flex;
  margin-bottom: 8px;
  justify-content: center;
`;

const FormBox = styled.div`
  margin: 2.5rem 0 1rem;
`;
