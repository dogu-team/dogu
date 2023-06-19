import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import useModal from '../../hooks/useModal';

import { menuItemButtonStyles } from '../../styles/button';
import DangerConfirmModal from '../modals/DangerConfirmModal';

type DangerItemButtonType = {
  danger: true;
  onConfirm: () => Promise<void>;
  modalContent: React.ReactNode;
  modalTitle: string;
  modalButtonTitle: string;
  footer?: React.ReactNode;
  persistOpen?: boolean;
  onClose?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type NormalItemButtonType = {
  danger: false;
  primary?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type Props = DangerItemButtonType | NormalItemButtonType;

const MenuItemButton = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, openModal, closeModal] = useModal();

  const onClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setLoading(true);
    await props.onClick?.(e);
    setLoading(false);
  };

  const handleClose = () => {
    if (props.danger) {
      props.onClose?.();
    }
    closeModal();
  };

  const handleConfirm = async () => {
    if (props.danger) {
      setLoading(true);
      await props.onConfirm();

      if (!props.persistOpen) {
        handleClose();
      }
      setLoading(false);
    }
  };

  return props.danger ? (
    <>
      <StyledButton {...props} onClick={() => openModal()} disabled={props.disabled || loading} />

      <DangerConfirmModal
        open={isOpen}
        title={props.modalTitle}
        buttonTitle={props.modalButtonTitle}
        onOk={handleConfirm}
        onCancel={handleClose}
        confirmLoading={loading}
        footer={props.footer}
      >
        {props.modalContent}
      </DangerConfirmModal>
    </>
  ) : props.primary ? (
    <StyledPrimaryButton {...props} onClick={onClick} disabled={props.disabled || loading} />
  ) : (
    <StyledButton {...props} onClick={onClick} disabled={props.disabled || loading} />
  );
};

export default MenuItemButton;

const StyledPrimaryButton = styled.button`
  ${menuItemButtonStyles}
  color: ${(props) => props.theme.colorPrimary};
  background-color: #fff;

  &:hover {
    color: #fff;
    background-color: ${(props) => props.theme.colorPrimary};
  }
`;

const StyledButton = styled.button`
  ${menuItemButtonStyles}
`;

const ModalContentBox = styled.div`
  margin-top: 1rem;
  white-space: pre-wrap;

  * {
    white-space: pre-wrap;
  }
`;
