import { OrganizationId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import { UserAndInvitationTokenBase } from '@dogu-private/console';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { AxiosError } from 'axios';

import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import { checkLoginInServerSide, getServersideCookies } from 'src/utils/auth';
import { NextPageWithLayout } from 'pages/_app';
import { redirectWithLocale } from '../../src/ssr/locale';
import { acceptInivitation, getInvitationServerSide } from '../../src/api/invitation';
import ProfileImage from '../../src/components/ProfileImage';
import useRequest from '../../src/hooks/useRequest';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../src/styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../src/utils/error';
import Head from 'next/head';

interface Props {
  email: string;
  token: string;
  invitation: UserAndInvitationTokenBase;
}

const InviteConfirmPage: NextPageWithLayout<Props> = ({ email, token, invitation }) => {
  const router = useRouter();
  const [loading, request] = useRequest(acceptInivitation);

  const handleAccept = async () => {
    try {
      const organizationId = invitation.organization?.organizationId ?? (router.query.organizationId as OrganizationId);
      await request({ email, organizationId, token });
      router.push(`/dashboard/${organizationId}`);
      sendSuccessNotification('You have successfully joined the organization');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to join the organization\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Confirm inviation | Dogu</title>
      </Head>
      <div>
        <FlexColumnBox>
          <div>
            <ProfileImage
              profileImageUrl={invitation.organization?.profileImageUrl}
              name={invitation.organization?.name}
              shape="square"
              size={48}
            />
          </div>
          <Description>
            You&apos;re invited to join <b>{invitation.organization?.name}</b> organization!
          </Description>
          <Description>
            If you accept the invitation, <b>you will leave your organization</b>.
          </Description>
        </FlexColumnBox>

        <FlexRowBox>
          <Button danger onClick={() => router.push('/account/organizations')} style={{ flex: 1 }}>
            Reject
          </Button>
          <Button type="primary" loading={loading} onClick={handleAccept} style={{ flex: 1 }}>
            Accept
          </Button>
        </FlexRowBox>
      </div>
    </>
  );
};

InviteConfirmPage.getLayout = function (page) {
  return <SmallBoxCenteredLayout titleI18nKey="auth:confirmInvitationPageTitle">{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { organizationId, email, token } = context.query;
  const mainRedirect = {
    redirect: redirectWithLocale(context, '/', false),
  };

  if (!organizationId || !email || !token) {
    return mainRedirect;
  }

  try {
    const { authToken } = getServersideCookies(context.req.cookies);

    if (!authToken) {
      return mainRedirect;
    }

    const [me, invitation] = await Promise.all([
      checkLoginInServerSide(context),
      getInvitationServerSide(email as string, organizationId as OrganizationId, token as string, authToken),
    ]);

    if (!me || !invitation) {
      return mainRedirect;
    }

    return {
      props: {
        email,
        token,
        invitation,
      },
    };
  } catch (e) {
    return mainRedirect;
  }
};

export default InviteConfirmPage;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}

  button {
    margin: 0 0.25rem;
  }
`;

const FlexColumnBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
  margin: 1rem 0 2rem;
`;

const Description = styled.p`
  line-height: 1.4;
  margin-top: 0.5rem;
  text-align: center;

  b {
    font-weight: 600;
  }
`;
