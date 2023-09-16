import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserAndInvitationTokenBase, OrganizationBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';

import { NextPageWithLayout } from 'pages/_app';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import ProfileImage from '../../src/components/ProfileImage';
import { flexRowCenteredStyle } from '../../src/styles/box';
import InviteSignInForm from '../../src/components/registery/InviteSignInForm';
import { getInvitationServerSideProps } from '../../src/ssr/invitation';
import SocialSignInForm from '../../src/components/social-signin/SocialSignInForm';
import Cookies from 'universal-cookie';

interface Props {
  email: string;
  token: string;
  invitation: UserAndInvitationTokenBase;
}

const InviteSigninPage: NextPageWithLayout<Props> = ({ email, token, invitation }) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Sign up | Dogu</title>
      </Head>
      <Box>
        <FlexColumnCentered>
          <div>
            <ProfileImage
              profileImageUrl={invitation.organization?.profileImageUrl}
              name={invitation.organization?.name}
              shape="square"
              size={48}
            />
          </div>
          <StyledTitle>
            You&apos;re invited to join <b>{invitation.organization?.name}</b> organization
          </StyledTitle>
        </FlexColumnCentered>

        <FormBox>
          <InviteSignInForm
            token={token}
            organizationId={invitation.organization?.organizationId ?? (router.query.organizationId as OrganizationId)}
          />
          {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
            <SocialSignInForm
              onClickButton={() => {
                const cookies = new Cookies();
                cookies.set(
                  'redirectUrl',
                  `/auth/invite-confirm?email=${email}&organizationId=${invitation.organizationId}&token=${token}`,
                  { path: '/' },
                );
              }}
            />
          )}
        </FormBox>

        <LinkWrapper>
          <FlexBox>
            <StyledLink href="/signin/forgot">{t('registery:signInForgotPasswordLinkText')}</StyledLink>
            <p>&nbsp;{t('registery:orText')}&nbsp;</p>
            <StyledLink href={{ pathname: '/signup/invite', query: router.query }}>
              {t('registery:signInSignUpLinkText')}
            </StyledLink>
          </FlexBox>
        </LinkWrapper>
      </Box>
    </>
  );
};

InviteSigninPage.getLayout = function (page) {
  return <SmallBoxCenteredLayout>{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = getInvitationServerSideProps;

export default InviteSigninPage;

const Box = styled.div``;

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

const LinkWrapper = styled.div`
  font-size: 14px;
  text-align: center;
`;

const FlexBox = styled.div`
  display: flex;
  margin-bottom: 8px;
  justify-content: center;
`;

const FormBox = styled.div`
  margin: 2.5rem 0 1rem;
`;
