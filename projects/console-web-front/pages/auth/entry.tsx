import { UserBase } from '@dogu-private/console';
import { USER_ACCESS_TOKEN_COOKIE_NAME, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { Button } from 'antd';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import Cookies from 'universal-cookie';

import { swrAuthFetcher } from '../../src/api';
import { sendVerifyEmail, signOut } from '../../src/api/registery';
import SmallBoxCenteredLayout from '../../src/components/layouts/SmallBoxCenterLayout';
import { redirectWithLocale } from '../../src/ssr/locale';
import { flexRowCenteredStyle } from '../../src/styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../src/utils/antd';
import { checkLoginInServerSide } from '../../src/utils/auth';
import { NextPageWithLayout } from '../_app';

interface Props {
  me: UserBase;
}

const VerifyAccountEntryPage: NextPageWithLayout<Props> = ({ me }) => {
  const { data } = useSWR<UserBase>('/registery/check', swrAuthFetcher, {
    fallbackData: me,
    revalidateOnFocus: true,
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const handleClickSend = async () => {
    setLoading(true);
    try {
      await sendVerifyEmail(me.email);
      sendSuccessNotification('Verify email sent!');
    } catch (e) {
      sendErrorNotification('Failed to send verification email');
    }
    setLoading(false);
  };

  if (data?.userAndVerificationToken?.status === USER_VERIFICATION_STATUS.VERIFIED) {
    router.push(
      router.query.redirect
        ? `${router.query.redirect}`
        : `/dashboard/${data.organizationAndUserAndOrganizationRoles?.[0].organizationId}`,
    );
    return null;
  }

  return (
    <>
      <Head>
        <title>Verify your email | Dogu</title>
      </Head>
      <Box>
        <DescriptionWrapper>
          <Description>{t('account:verifyEntryDescription', { name: me.name })}</Description>
        </DescriptionWrapper>

        <FlexWrapper>
          <ResendParagraph>{t('account:verifyEntryEmailDescription')}</ResendParagraph>
          <div>
            <StyledButton type="ghost" onClick={handleClickSend} loading={loading}>
              {t('common:resendEmail')}
            </StyledButton>
          </div>
        </FlexWrapper>

        <FlexWrapper style={{ marginTop: '1rem' }}>
          <StyledButton
            type="ghost"
            onClick={async () => {
              try {
                await signOut();
              } catch (e) {
                const cookie = new Cookies();
                cookie.remove(USER_ACCESS_TOKEN_COOKIE_NAME);
              }
              router.push('/');
            }}
          >
            Sign out
          </StyledButton>
        </FlexWrapper>
      </Box>
    </>
  );
};

VerifyAccountEntryPage.getLayout = (page) => {
  return <SmallBoxCenteredLayout titleI18nKey="account:verifyEntryPageTitle">{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const me = await checkLoginInServerSide(context);

  if (!me) {
    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }

  if (
    process.env.NEXT_PUBLIC_ENV === 'local' ||
    process.env.NEXT_PUBLIC_ENV === 'e2e' ||
    process.env.NEXT_PUBLIC_ENV === 'self-hosted'
  ) {
    return {
      redirect: redirectWithLocale(
        context,
        `/dashboard/${me.organizationAndUserAndOrganizationRoles?.[0].organizationId}`,
        false,
      ),
    };
  }

  if (me.userAndVerificationToken?.status === USER_VERIFICATION_STATUS.VERIFIED) {
    return {
      redirect: redirectWithLocale(
        context,
        `/dashboard/${me.organizationAndUserAndOrganizationRoles?.[0].organizationId}`,
        false,
      ),
    };
  }

  return {
    props: {
      me,
    },
  };
};

export default VerifyAccountEntryPage;

const Box = styled.div`
  margin-top: 2rem;
`;

const DescriptionWrapper = styled.div`
  margin-bottom: 2rem;
`;

const Description = styled.p`
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: keep-all;
  text-align: center;
`;

const FlexWrapper = styled.div`
  ${flexRowCenteredStyle}
`;

const ResendParagraph = styled.p`
  font-size: 0.9rem;
`;

const StyledButton = styled(Button)`
  span {
    text-decoration: underline !important;
    color: ${(props) => props.theme.colorPrimary};
  }
`;
