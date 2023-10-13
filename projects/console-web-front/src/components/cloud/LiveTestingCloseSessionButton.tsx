import { LiveSessionId, OrganizationId } from '@dogu-private/types';
import { Button, ButtonProps } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { shallow } from 'zustand/shallow';

import { closeLiveTestingSession } from '../../api/live-session';
import useRequest from '../../hooks/useRequest';
import useEventStore from '../../stores/events';
import { sendErrorNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props extends Omit<ButtonProps, | 'danger' | 'onClick' | 'loading'> {
  onClose?: () => void;
}

const LiveTestingCloseSessionButton: React.FC<Props> = ({ onClose, children, ...props }) => {
  const router = useRouter();
  const { sessionId, orgId } = router.query;
  const [loading, request] = useRequest(closeLiveTestingSession);
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const handleClose = async () => {
    try {
      await request(sessionId as LiveSessionId, orgId as OrganizationId);
      fireEvent('onCloudLiveTestingSessionClosed', sessionId);
      onClose?.();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Cannot close session: ${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <Button {...props} danger onClick={handleClose} loading={loading}>
      {children}
    </Button>
  );
};

export default LiveTestingCloseSessionButton;
