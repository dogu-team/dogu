import { LiveSessionId, OrganizationId } from '@dogu-private/types';
import { Button, ButtonProps, Modal } from 'antd';
import { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';

import { closeLiveTestingSession } from '../../api/live-session';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useEventStore from '../../stores/events';
import { sendErrorNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props extends Omit<ButtonProps, 'danger' | 'onClick' | 'loading'> {
  organizationId: OrganizationId;
  sessionId: LiveSessionId;
  onClose?: () => void;
}

const LiveTestingCloseSessionButton: React.FC<Props> = ({ organizationId, sessionId, onClose, children, ...props }) => {
  const [loading, request] = useRequest(closeLiveTestingSession);
  const [isOpen, openModal, closeModal] = useModal();
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const handleClose = async () => {
    try {
      await request(sessionId, organizationId);
      fireEvent('onCloudLiveTestingSessionClosed', sessionId);
      onClose?.();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Cannot close session: ${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <>
      <Button {...props} danger onClick={() => openModal()}>
        {children}
      </Button>

      <Modal
        open={isOpen}
        centered
        title="End live session"
        closable
        destroyOnClose
        onCancel={() => closeModal()}
        onOk={handleClose}
        okButtonProps={{ danger: true, loading: loading }}
        okText="End session"
        cancelText="Keep session"
      >
        <p style={{ lineHeight: '1.5' }}>
          Are you sure you want to end the live session?
          <br />
          <span style={{ fontWeight: '600' }}>Your data will be fully removed.</span>
        </p>
      </Modal>
    </>
  );
};

export default LiveTestingCloseSessionButton;
