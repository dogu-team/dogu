import { CheckCircleOutlined } from '@ant-design/icons';
import { UserId } from '@dogu-private/types';
import { isAxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';

import api from '../../../src/api';
import ErrorBox from '../../../src/components/common/boxes/ErrorBox';
import DoguText from '../../../src/components/common/DoguText';
import Header from '../../../src/components/layouts/Header';
import { flexRowCenteredStyle } from '../../../src/styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import { NextPageWithLayout } from '../../_app';

interface Props {
  isSuccess: boolean;
  message?: string;
  userId: UserId;
  token: string;
}

const UnsubscribePage: NextPageWithLayout<Props> = ({ isSuccess, message, userId, token }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await api.post<void>('/registery/email/subscribe', { userId, token });
      sendSuccessNotification('You have been subscribed to Dogu newsletter.');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to subscribe email.\n${getErrorMessageFromAxios(e)}`);
      }
    }
    setLoading(false);
  };

  return (
    <Box>
      {isSuccess ? (
        <FlexCentered>
          <IconWrapper>
            <CheckCircleOutlined style={{ fontSize: '3rem', color: 'green' }} />
          </IconWrapper>
          <StyledH1>Unsubscribed</StyledH1>
          <p style={{ textAlign: 'center', lineHeight: '1.5' }}>
            You have been unsubscribed from <DoguText /> newsletter.
            <br />
            <Link href="/">Move to home</Link> or{' '}
            <SubscribeButton onClick={handleSubscribe} disabled={loading}>
              Subscribe again
            </SubscribeButton>
          </p>
        </FlexCentered>
      ) : (
        <ErrorBox title="Something went wrong" desc={message ?? null} />
      )}
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { userId, token } = context.query as { userId: UserId | undefined; token: string | undefined };

  if (!userId || !token) {
    return {
      notFound: true,
    };
  }

  try {
    await api.post<void>('/registery/email/unsubscribe', { userId, token });
    return {
      props: {
        isSuccess: true,
        userId,
        token,
      },
    };
  } catch (e) {
    if (isAxiosError(e)) {
      return {
        props: {
          isSuccess: false,
          message: getErrorMessageFromAxios(e),
          userId,
          token,
        },
      };
    }

    if (e instanceof Error) {
      return {
        props: {
          isSuccess: false,
          message: e.message,
          userId,
          token,
        },
      };
    }

    return {
      props: {
        isSuccess: false,
        message: 'Unknown error',
        userId,
        token,
      },
    };
  }
};

UnsubscribePage.getLayout = (page) => {
  return (
    <LayoutBox>
      <Header />
      {page}
    </LayoutBox>
  );
};

export default UnsubscribePage;

const LayoutBox = styled.div`
  width: 100%;
  height: calc(100vh - 57px);
`;

const Box = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  flex: 1;
`;

const IconWrapper = styled.div`
  margin-bottom: 1rem;
`;

const StyledH1 = styled.h1`
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
`;

const FlexCentered = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const SubscribeButton = styled.button`
  background-color: #fff;
  color: ${(props) => props.theme.colorPrimary};
`;
