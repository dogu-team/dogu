import { Button, ButtonProps } from 'antd';
import { useState } from 'react';
import useModal from '../../hooks/useModal';
import DangerConfirmModal from '../modals/DangerConfirmModal';

interface Props extends Omit<ButtonProps, 'type' | 'danger' | 'onClick'> {
  modalTitle: React.ReactNode;
  modalContent: React.ReactNode;
  modalButtonTitle: React.ReactNode;
  onConfirm: () => Promise<void> | void;
}

const DisconnectButton = ({ modalTitle, modalContent, onConfirm, modalButtonTitle, ...props }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();

  const handleConfirm = async () => {
    await onConfirm();
    closeModal();
  };

  return (
    <>
      <Button
        {...props}
        type="text"
        danger
        onClick={(e) => {
          openModal();
        }}
      />

      <DangerConfirmModal
        open={isOpen}
        destroyOnClose
        title={modalTitle}
        onOk={handleConfirm}
        confirmLoading={!!props.loading}
        buttonTitle={modalButtonTitle}
        onCancel={closeModal}
      >
        {modalContent}
      </DangerConfirmModal>
    </>
  );
};

export default DisconnectButton;
