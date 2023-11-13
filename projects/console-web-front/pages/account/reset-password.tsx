import { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Head from 'next/head';
import { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';

import { NextPageWithLayout } from 'pages/_app';
import { checkResetPasswordEmailAndToken, resetPasswordWithToken } from 'src/api/registery';
import ResetPasswordForm from 'src/components/registery/ResetPasswordForm';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import { getErrorMessageFromAxios } from 'src/utils/error';
import { sendErrorNotification, sendSuccessNotification } from '../../src/utils/antd';
import { redirectWithLocale } from '../../src/ssr/locale';

enum ResetPasswordErrorType {
  NONE = '',
  INVALID = 'invalid',
  UNKNOWN = 'unknown',
}

interface Props {
  token: string;
  email: string;
  error: ResetPasswordErrorType | undefined;
}

const ResetPasswordPage: NextPageWithLayout<Props> = ({ token, email, error }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async (_: string | undefined, newPassword: string, confirmPassword: string) => {
      try {
        await resetPasswordWithToken({
          email,
          token,
          newPassword,
          confirmPassword,
        });
        sendSuccessNotification(t('account:resetPasswordWithTokenSuccessMsg'));
        router.push('/signin');
      } catch (e) {
        if (e instanceof AxiosError) {
          sendErrorNotification(t('account:resetPasswordWithTokenFailMsg', { reason: getErrorMessageFromAxios(e) }));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [email, token],
  );

  // TODO:
  // if (error !== ResetPasswordErrorType.NONE) {
  //   router.push('/');
  //   return null;
  // }

  return (
    <>
      <Head>
        <title>Reset password | Dogu</title>
      </Head>
      <Box>
        <ResetPasswordForm needCurrentPassword={false} onFinish={handleSubmit} submitButtonStyle={{ width: '100%' }} />
      </Box>
    </>
  );
};

ResetPasswordPage.getLayout = (page) => {
  return <SmallBoxCenteredLayout titleI18nKey="Reset Password">{page}</SmallBoxCenteredLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token, email } = context.query;

  if (!token || !email) {
    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }

  let error: ResetPasswordErrorType = ResetPasswordErrorType.NONE;

  try {
    await checkResetPasswordEmailAndToken(email as string, token as string);
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 403) {
        error = ResetPasswordErrorType.INVALID;
      } else {
        error = ResetPasswordErrorType.UNKNOWN;
      }
    }
  }

  return {
    props: {
      token,
      email,
      error,
    },
  };
};

export default ResetPasswordPage;

const Box = styled.div`
  margin-top: 1.5rem;
`;
