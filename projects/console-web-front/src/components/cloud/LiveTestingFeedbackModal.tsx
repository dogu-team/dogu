import { LiveSessionId, UserId } from '@dogu-private/types';
import { Form, Input, Modal, Rate } from 'antd';
import axios from 'axios';
import { useState } from 'react';

import { LiveTestingFeedbackDto } from '../../../pages/api/feedbacks/live-testing';
import { sendSuccessNotification } from '../../utils/antd';

export const LIVE_TESTING_FEEDBACK_LOCAL_STORAGE_KEY = 'live-testing-feedback';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: UserId;
  sessionId: LiveSessionId;
}

const LiveTestingFeedbackModal: React.FC<Props> = ({ isOpen, onClose, userId, sessionId }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<{ rate: number; comment: string }>();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { rate, comment } = form.getFieldsValue();
      const dto: LiveTestingFeedbackDto = {
        userId,
        liveSessionId: sessionId,
        rate,
        comment,
      };
      await axios.post(`/api/feedbacks/live-testing`, dto);
      localStorage.setItem(LIVE_TESTING_FEEDBACK_LOCAL_STORAGE_KEY, 'true');
      handleClose();
      sendSuccessNotification('Feedback sent!');
    } catch (e) {}
    setLoading(false);
  };

  return (
    <Modal
      open={isOpen}
      destroyOnClose
      closable
      centered
      onCancel={handleClose}
      title={'Give us a feedback!'}
      onOk={handleSubmit}
      confirmLoading={loading}
      okButtonProps={{
        htmlType: 'submit',
        form: 'live-testing-feedback-form',
      }}
      okText={'Send'}
    >
      <Form form={form} layout="vertical" id="live-testing-feedback-form">
        <Form.Item name="rate" label={'How was the overall experience?'}>
          <Rate />
        </Form.Item>
        <Form.Item name="comment" label={'Please write your feedback here!'}>
          <Input.TextArea placeholder={`Tell us anything! (Bug report, Feature request)`} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LiveTestingFeedbackModal;
