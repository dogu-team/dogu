import { LoadingOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { verifyEmail } from 'src/api/registery';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import { redirectWithLocale } from '../../src/ssr/locale';

interface Props {
  email: string;
  token: string;
}

const VerifyEmailPage: NextPage<Props> = ({ email, token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(email, token);
        router.push('/');
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response?.status === 403) {
            setError('Expired link');
          } else if (e.response?.status === 404 || e.response?.status === 400) {
            setError('Invalid link');
          } else {
            setError('Failed to verify your email');
          }
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  return (
    <>
      <Head>Verification | Dogu</Head>
      <Box>{loading ? <LoadingOutlined /> : error ? <ErrorBox title="Somthing went wrong" desc={error} /> : <p>verified</p>}</Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { email, token } = context.query;

  if (!email || !token) {
    return {
      redirect: redirectWithLocale(context, '/signin', false),
    };
  }

  return {
    props: {
      email,
      token,
    },
  };
};

export default VerifyEmailPage;

const Box = styled.div`
  padding: 1.5rem;
`;
