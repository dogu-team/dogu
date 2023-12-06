import { WarningTwoTone } from '@ant-design/icons';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { LiveSessionId, LiveSessionState, LiveSessionWsMessage, WS_PING_MESSAGE } from '@dogu-private/types';
import { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { useRouter } from 'next/router';
import { shallow } from 'zustand/shallow';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { transform } from '@dogu-tech/common';
import { CloudLicenseMessage } from '@dogu-private/console';

import { NextPageWithLayout } from 'pages/_app';
import ManualTesting from 'src/components/studio/LiveTesting';
import {
  getCloudDeviceStudioTestingServerSideProps,
  CloudStudioTestingPageProps,
  getCloudStudioTestingLayout,
} from 'enterprise/pages/studio';
import useEventStore from '../../../../../src/stores/events';
import useModal from '../../../../../src/hooks/useModal';
import useWebSocket from '../../../../../src/hooks/useWebSocket';
import CountDownTimer from '../../../../../src/components/common/CountDownTimer';
import LiveTestingCloseSessionButton from '../../../../../src/components/cloud/LiveTestingCloseSessionButton';

const CloudLiveTestingStudioPage: NextPageWithLayout<CloudStudioTestingPageProps> = ({ organization, me, device }) => {
  const [isOpen, openModal, closeModal, payload] = useModal<string>();
  const router = useRouter();
  const cloudHeartbeatSocketRef = useWebSocket(
    `/live-session-heartbeat?organizationId=${organization.organizationId}&liveSessionId=${router.query.sessionId}`,
  );
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);
  const { t } = useTranslation('device-streaming');
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    if (cloudHeartbeatSocketRef.current) {
      const handleClose = () => {
        fireEvent('onCloudHeartbeatSocketClosed');
        setIsEnd(true);
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.data === WS_PING_MESSAGE) {
          return;
        }

        try {
          const data = JSON.parse(event.data) as LiveSessionWsMessage;
          if (data.type === LiveSessionState.CLOSE_WAIT) {
            openModal(data.message);
          } else if (data.type === 'cloud-license-live-testing') {
            const parsed = transform(CloudLicenseMessage.LiveTestingReceive, JSON.parse(data.message));
            fireEvent('onCloudRemainingFreeSecondMessage', parsed);
          }
        } catch (e) {
          console.error('Invalid message: ', event.data);
        }
      };

      cloudHeartbeatSocketRef.current.onclose = (e) => {
        console.debug('livesession heartbeat closed', e);
        handleClose();
      };
      cloudHeartbeatSocketRef.current.onerror = (e) => {
        console.debug('livesession heartbeat error', e);
        handleClose();
      };
      cloudHeartbeatSocketRef.current.onmessage = handleMessage;

      return () => {
        console.debug('livesession heartbeat closing');
        // eslint-disable-next-line react-hooks/exhaustive-deps
        cloudHeartbeatSocketRef.current?.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onDeviceInput') {
        cloudHeartbeatSocketRef.current?.send('input');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <ManualTesting organization={organization} device={device} me={me} hideDeviceSelector isCloudDevice />

      <Modal
        title={
          <>
            <WarningTwoTone twoToneColor="#e99957" />
            &nbsp;{t('liveSessionToCloseWaitModalTitle')}
          </>
        }
        open={isOpen && !isEnd}
        closable={false}
        footer={
          isEnd ? null : (
            <>
              <LiveTestingCloseSessionButton
                onClose={() => {
                  closeModal();
                  window.close();
                }}
                organizationId={organization.organizationId}
                sessionId={router.query.sessionId as LiveSessionId}
              >
                Close session
              </LiveTestingCloseSessionButton>
              <Button
                type="primary"
                onClick={() => {
                  fireEvent('onDeviceInput', {});
                  closeModal();
                }}
              >
                Keep using
              </Button>
            </>
          )
        }
        destroyOnClose
        centered
      >
        <p style={{ lineHeight: '1.5' }}>
          <Trans
            i18nKey="device-streaming:liveSessionToCloseWaitModalContent"
            components={{
              br: <br />,
              timer: isOpen ? (
                <CountDownTimer startedAt={new Date()} endMs={Number(payload) || 3 * 60 * 1000} />
              ) : (
                <></>
              ),
            }}
          />
        </p>
      </Modal>
    </Box>
  );
};

CloudLiveTestingStudioPage.getLayout = getCloudStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<CloudStudioTestingPageProps> =
  getCloudDeviceStudioTestingServerSideProps;

export default CloudLiveTestingStudioPage;

const Box = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex: 1;
`;
