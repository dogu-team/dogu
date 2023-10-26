import { LiveSessionId, UserId } from '@dogu-private/types';
import { Button } from 'antd';
import { MdOutlineFeedback } from 'react-icons/md';

import useModal from '../../../hooks/useModal';
import LiveTestingFeedbackModal from './LiveTestingFeedbackModal';

interface Props {
  userId: UserId;
  sessionId: LiveSessionId;
}

const LiveTestingFeedbackButton: React.FC<Props> = ({ userId, sessionId }) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button
        style={{ display: 'flex', alignItems: 'center' }}
        icon={<MdOutlineFeedback style={{ marginRight: '.25rem' }} />}
        onClick={() => openModal()}
      >
        Feedback
      </Button>

      <LiveTestingFeedbackModal isOpen={isOpen} onClose={closeModal} userId={userId} sessionId={sessionId} />
    </>
  );
};

export default LiveTestingFeedbackButton;
