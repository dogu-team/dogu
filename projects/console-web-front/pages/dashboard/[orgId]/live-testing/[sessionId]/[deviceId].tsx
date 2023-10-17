import { WarningTwoTone } from '@ant-design/icons';
import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import { LiveSessionState, LiveSessionWsMessage } from '@dogu-private/types';
import { useEffect } from 'react';
import { Modal } from 'antd';
import { useRouter } from 'next/router';
import { shallow } from 'zustand/shallow';

import { NextPageWithLayout } from 'pages/_app';
import ManualTesting from 'src/components/studio/ManualTesting';
import {
  getCloudDeviceStudioTestingServerSideProps,
  CloudStudioTestingPageProps,
  getCloudStudioTestingLayout,
} from 'enterprise/pages/studio';
import useEventStore from '../../../../../src/stores/events';
import useModal from '../../../../../src/hooks/useModal';
import useWebSocket from '../../../../../src/hooks/useWebSocket';
import CountDownTimer from '../../../../../src/components/common/CountDownTimer';

const CloudLiveTestingStudioPage: NextPageWithLayout<CloudStudioTestingPageProps> = ({ organization, me, device }) => {
  const [isOpen, openModal, closeModal, payload] = useModal<string>();
  const router = useRouter();
  const cloudHeartbeatSocketRef = useWebSocket(
    `/live-session-heartbeat?organizationId=${organization.organizationId}&liveSessionId=${router.query.sessionId}`,
  );
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  useEffect(() => {
    if (cloudHeartbeatSocketRef.current) {
      const handleClose = () => {
        fireEvent('onCloudHeartbeatSocketClosed');
      };

      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as LiveSessionWsMessage;
          if (data.type === LiveSessionState.CLOSE_WAIT) {
            openModal(data.message);
          }
        } catch (e) {
          console.error('Invalid message: ', event.data);
        }
      };

      cloudHeartbeatSocketRef.current.onclose = handleClose;
      cloudHeartbeatSocketRef.current.onerror = handleClose;
      cloudHeartbeatSocketRef.current.onmessage = handleMessage;

      return () => {
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
  }, []);

  return (
    <Box>
      <ManualTesting organization={organization} device={device} me={me} hideDeviceSelector isCloudDevice />

      <Modal
        title={
          <>
            <WarningTwoTone twoToneColor="#e99957" />
            &nbsp;Your session will be closed!
          </>
        }
        open={isOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        centered
      >
        <p style={{ lineHeight: '1.5' }}>
          There is no interaction for 20 minutes.
          <br />
          Your session will be closed in{' '}
          {isOpen && <CountDownTimer startedAt={new Date()} endMs={Number(payload) || 3 * 60 * 1000} />}
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
