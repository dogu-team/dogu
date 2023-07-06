import { Button, ButtonProps } from 'antd';
import { createContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import useModal from '../../../hooks/useModal';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../../styles/box';

import { CommonUIProps } from '../../../types/common';
import DangerConfirmModal from '../../modals/DangerConfirmModal';

interface Props extends CommonUIProps {
  children: React.ReactNode;
}

const DangerZone = ({ children, className }: Props) => {
  return (
    <Box className={className}>
      <StyledTitle className="danger-box-title">Danger</StyledTitle>
      <Inner className="danger-box-inner">{children}</Inner>
    </Box>
  );
};

interface ItemProps {
  button: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}

const DangerZoneItem = ({ button, title, description }: ItemProps) => {
  return (
    <Item>
      <ItemTextInner>
        <ItemTitleWrapper>
          <ItemTitle>{title}</ItemTitle>
        </ItemTitleWrapper>
        <div>
          <ItemDescription>{description}</ItemDescription>
        </div>
      </ItemTextInner>
      <ItemButtonWrapper>{button}</ItemButtonWrapper>
    </Item>
  );
};

interface ItemButtonProps {
  children: React.ReactNode;
  modalTitle: React.ReactNode;
  modalButtonTitle: React.ReactNode;
  modalContent: React.ReactNode;
  buttonProps?: ButtonProps;
  footer?: React.ReactNode;
  persistOpen?: boolean;
  onConfirm: () => Promise<void> | void;
  onOpenChange?: (isOpen: boolean) => void;
}

const DangerZoneButton = ({ children, modalTitle, modalButtonTitle, modalContent, buttonProps, footer, persistOpen, onConfirm, onOpenChange }: ItemButtonProps) => {
  const [isOpen, openModal, closeModal] = useModal();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (e) {
      setLoading(false);
      return;
    }
    setLoading(false);

    if (!persistOpen) {
      closeModal();
    }
  };

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen]);

  return (
    <>
      <Button danger onClick={() => openModal()}>
        {children}
      </Button>

      <DangerConfirmModal
        open={isOpen}
        title={modalTitle}
        buttonTitle={modalButtonTitle}
        onOk={handleConfirm}
        confirmLoading={loading}
        onCancel={closeModal}
        destroyOnClose
        footer={footer}
        buttonProps={buttonProps}
      >
        {modalContent}
      </DangerConfirmModal>
    </>
  );
};

DangerZone.Item = DangerZoneItem;
DangerZone.Button = DangerZoneButton;

export default DangerZone;

const Box = styled.div`
  position: relative;
  user-select: none;
`;

const Inner = styled.div`
  padding-top: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ff4d4f;
  overflow: hidden;

  div:last-child {
    border-bottom: none;
  }
`;

const StyledTitle = styled.p`
  position: absolute;
  left: 0.5rem;
  top: -0.7rem;
  padding: 0 0.5rem;
  background-color: #fff;
  line-height: 1.4;
  font-size: 1.1rem;
  font-weight: 500;
  color: #ff4d4f;
`;

const Item = styled.div`
  ${flexRowBaseStyle}
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const ItemTextInner = styled.div`
  flex: 1;
`;

const ItemTitleWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const ItemTitle = styled.p`
  font-weight: 700;
  line-height: 1.4;
`;

const ItemDescription = styled.p`
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const ItemButtonWrapper = styled.div`
  margin-left: 1rem;
  flex-shrink: 0;
`;
