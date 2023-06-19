import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserAndInvitationTokenBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import { useCallback } from 'react';
import { AxiosError } from 'axios';

import { NextPageWithLayout } from 'pages/_app';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import ServiceAgreement from 'src/components/registery/ServiceAgreement';
import ProfileImage from '../../src/components/ProfileImage';
import { flexRowCenteredStyle } from '../../src/styles/box';
import SignUpForm from '../../src/components/registery/SignUpForm';
import { signUp } from '../../src/api/registery';
import { sendErrorNotification } from '../../src/utils/antd';
import { getErrorMessage } from '../../src/utils/error';
import { getInvitationServerSideProps } from '../../src/ssr/invitation';
import SocialSignInForm from '../../src/components/social-signin/SocialSignInForm';
import Cookies from 'universal-cookie';

interface Props {
  email: string;
  token: string;
  invitation: UserAndInvitationTokenBase;
}

const InviteSignupPage: NextPageWithLayout<Props> = ({ email, token, invitation }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignUp = useCallback(
    async (_: string, name: string, password: string, newsletter: boolean) => {
      try {
        await signUp({
          email,
          name,
          password,
          newsletter: newsletter ?? false,
          invitationOrganizationId: invitation.organization?.organizationId,
          invitationToken: token,
        });
        router.push(`/auth/invite-confirm?email=${email}&organizationId=${invitation.organization?.organizationId}&token=${token}`);
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response?.status === 409) {
            sendErrorNotification(t('registery:signUpAlreadyExistEmailErrorMsg'));
          } else {
            sendErrorNotification(t('registery:signUpFailedErrorMsg', { reason: getErrorMessage(e) }));
          }
        }
      }
    },
    [email, token, invitation.organization?.organizationId],
  );

  return (
    <>
      <Head>
        <title>Sign up | Dogu</title>
      </Head>
      <Box>
        <FlexColumnCentered>
          <div>
            <ProfileImage profileImageUrl={invitation.organization?.profileImageUrl} name={invitation.organization?.name} shape="square" size={48} />
          </div>
          <StyledTitle>
            You&apos;re invited to join <b>{invitation.organization?.name}</b> organization
          </StyledTitle>
        </FlexColumnCentered>
        <div style={{ marginTop: '2rem' }}>
          <p style={{ textAlign: 'center' }}>New to Dogu? Create an account</p>
        </div>
        <SignUpForm onSubmit={handleSignUp} defaultEmail={email} />
        {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
          <SocialSignInForm
            onClickButton={() => {
              const cookies = new Cookies();
              cookies.set('redirectUrl', `/auth/invite-confirm?email=${email}&organizationId=${invitation.organizationId}&token=${token}`, { path: '/' });
            }}
          />
        )}

        <div style={{ marginTop: '1rem' }}>
          <ServiceAgreement />
          <AccountText>
            <Trans i18nKey="registery:signUpAlreadyAccountExist" components={[<StyledLink key="signin" href={{ pathname: '/signin/invite', query: router.query }} />]} />
          </AccountText>
        </div>
      </Box>
    </>
  );
};

InviteSignupPage.getLayout = function (page) {
  return <SmallBoxCenteredLayout>{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = getInvitationServerSideProps;

export default InviteSignupPage;

const Box = styled.div``;

const AccountText = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.colors.link};
`;

const FlexColumnCentered = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const StyledTitle = styled.p`
  margin-top: 0.5rem;
  font-size: 1.1rem;

  b {
    font-weight: 700;
  }
`;
