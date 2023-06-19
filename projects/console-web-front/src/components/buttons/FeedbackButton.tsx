import styled from 'styled-components';
import { MdOutlineFeedback } from 'react-icons/md';
import { Form, Input, Modal, Tooltip } from 'antd';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';

import { flexRowCenteredStyle } from '../../styles/box';
import useModal from '../../hooks/useModal';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { sendFeedback } from '../../api/common';
import useRequest from '../../hooks/useRequest';

const FeedbackButton = () => {
  const [isOpen, openModal, closeModal] = useModal();
  const [value, setValue] = useState('');
  const [loading, request] = useRequest(sendFeedback);
  const { t } = useTranslation('common');

  const handleClose = () => {
    setValue('');
    closeModal();
  };

  const handleSend = async () => {
    if (!value) {
      return;
    }

    try {
      await request(value);
      sendSuccessNotification(t('feedbackModalSuccessMessage'));
      handleClose();
    } catch (e) {
      sendErrorNotification(t('feedbackModalFailureMessage'));
    }
  };

  return (
    <>
      <Tooltip title="Feedback" arrow={false} overlayInnerStyle={{ fontSize: '.8rem' }} style={{ minHeight: '0' }}>
        <StyledButton onClick={() => openModal()}>
          <MdOutlineFeedback />
        </StyledButton>
      </Tooltip>

      <Modal
        title={t('feedbackModalTitle')}
        closable
        onCancel={handleClose}
        open={isOpen}
        centered
        onOk={handleSend}
        confirmLoading={loading}
        cancelText={t('cancel')}
        okText={t('sendFeedbackButtonTitle')}
      >
        <Input.TextArea
          placeholder={t('feedbackModalTextareaPlaceholder')}
          autoSize={{ minRows: 3, maxRows: 6 }}
          minLength={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default FeedbackButton;

const StyledButton = styled.button`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  margin-right: 0.25rem;
  border-radius: 50%;
  color: #000;
  background-color: #fff;
  font-size: 1.2rem;

  &:hover {
    background-color: #f5f5f5;
  }
`;
