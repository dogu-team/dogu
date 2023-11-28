import { CheckCircleOutlined } from '@ant-design/icons';
import { CloudLicenseResponse, SelfHostedLicenseResponse, UserBase } from '@dogu-private/console';
import { Button } from 'antd';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { getLicenseInServerSide } from '../../enterprise/api/license';
import LiveChat from '../../src/components/external/livechat';
import ConsoleBasicLayout from '../../src/components/layouts/ConsoleBasicLayout';
import Footer from '../../src/components/layouts/Footer';
import { checkUserVerifiedInServerSide } from '../../src/utils/auth';
import { NextPageWithLayout } from '../_app';

interface BillingPageProps {
  me: UserBase;
  license: CloudLicenseResponse | SelfHostedLicenseResponse;
}

const BillingSuccessPage: NextPageWithLayout<BillingPageProps> = ({ me, license }) => {
  const router = useRouter();
  const [remainSeconds, setRemainSeconds] = useState(5);
  const timer = useRef<NodeJS.Timer>();

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainSeconds((prev) => prev - 1);
    }, 1000);
    timer.current = interval;

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainSeconds === 0) {
      router.back();
      clearInterval(timer.current);
    }
  }, [remainSeconds]);

  return (
    <>
      <Head>
        <title>Purchase Success | Dogu</title>
      </Head>
      <Box>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: '3rem', color: '#52c41a' }} />
          <h1 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>Thanks for your purchase!</h1>
        </div>
        <p style={{ marginTop: '1rem' }}>
          Automatically return to the original page after {remainSeconds} {remainSeconds > 1 ? 'seconds' : 'second'}.
        </p>
        <div>
          <Button type="link" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </Box>
    </>
  );
};

BillingSuccessPage.getLayout = (page) => {
  return (
    <ConsoleBasicLayout user={page.props.me} license={page.props.license}>
      {page}
      <Footer />
      <LiveChat />
    </ConsoleBasicLayout>
  );
};

export const getServerSideProps: GetServerSideProps<BillingPageProps> = async (context) => {
  try {
    const result = await checkUserVerifiedInServerSide(context);

    if (result.redirect) {
      return result;
    }

    const license = await getLicenseInServerSide(context);

    return {
      props: {
        me: result.props.user,
        license,
      },
    };
  } catch (e) {}

  return {
    notFound: true,
  };
};

export default BillingSuccessPage;

const Box = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  line-height: 1.5;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Content = styled.section`
  margin-bottom: 2rem;
`;

const TitleWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const ContentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ContentInner = styled.div`
  font-size: 0.9rem;
`;
