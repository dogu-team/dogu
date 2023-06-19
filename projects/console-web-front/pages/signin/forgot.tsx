import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { AxiosError } from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import { checkLoginInServerSide, redirectToLastAccessOrganization } from 'src/utils/auth';
import InputItem from 'src/components/forms/InputItem';
import { sendResetPasswordEmail } from 'src/api/registery';
import SubmitButton from 'src/components/buttons/SubmitButton';
import SmallBoxCenteredLayout from 'src/components/layouts/SmallBoxCenterLayout';
import { NextPageWithLayout } from 'pages/_app';
import { sendErrorNotification, sendSuccessNotification } from '../../src/utils/antd';
import { redirectWithLocale } from '../../src/ssr/locale';

const Box = styled.div``;

const InputBox = styled.div`
  margin-top: 32px;
`;

const ButtonBox = styled.div`
  margin-top: 16px;
`;

const LinkWrapper = styled.div`
  display: flex;
  margin-top: 8px;
  justify-content: center;
  font-size: 14px;
`;

const ForgotPasswordPage: NextPageWithLayout = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (email) {
      try {
        await sendResetPasswordEmail(email);
        sendSuccessNotification(t('common:sendEmailSuccess'));
        setEmail('');
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response?.status === 404) {
            setError('Check your email');
          } else {
            sendErrorNotification('Failed to send email. Please retry.');
          }
        }
      }
    } else {
      setError('Check your email');
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Forgot password | Dogu</title>
      </Head>
      <Box>
        <form onSubmit={handleSubmit}>
          <InputBox>
            <InputItem
              desc={t('registery:forgotPasswordFormEmailLabel')}
              type="email"
              value={email}
              placeholder={t('registery:forgotPasswordFormEmailPlaceholder')}
              onChange={handleInput}
              errorMsg={error}
            />
          </InputBox>
          <ButtonBox>
            <SubmitButton loading={loading} disabled={loading}>
              {t('registery:forgotPasswordSubmitButtonTitle')}
            </SubmitButton>
          </ButtonBox>
        </form>
        <LinkWrapper>
          <StyledLink href="/signin">{t('registery:forgotPasswordSignInLinkText')}</StyledLink>
          &nbsp;{t('registery:orText')}&nbsp;
          <StyledLink href="/signup">{t('registery:forgotPasswordSignUpLinkText')}</StyledLink>
        </LinkWrapper>
      </Box>
    </>
  );
};

ForgotPasswordPage.getLayout = function (page) {
  return <SmallBoxCenteredLayout titleI18nKey="registery:forgotPasswordPageTitle">{page}</SmallBoxCenteredLayout>;
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

export default ForgotPasswordPage;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.colors.link};
`;
