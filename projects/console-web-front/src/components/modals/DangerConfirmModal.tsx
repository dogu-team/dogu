import { Button, ButtonProps, Modal, ModalProps } from 'antd';
import styled from 'styled-components';

interface Props extends ModalProps {
  buttonTitle: React.ReactNode;
  buttonProps?: ButtonProps;
}

export const DangerConfirmModal = ({ buttonTitle, children, buttonProps, ...props }: Props) => {
  return (
    <Modal
      {...props}
      centered
      closable
      footer={
        props.footer !== undefined ? (
          props.footer
        ) : (
          <div>
            {/* @ts-ignore */}
            <Button {...buttonProps} danger type="primary" style={{ width: '100%' }} onClick={props.onOk} loading={props.confirmLoading}>
              {buttonTitle}
            </Button>
          </div>
        )
      }
    >
      <ModalContentBox
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </ModalContentBox>
    </Modal>
  );
};

export default DangerConfirmModal;

const ModalContentBox = styled.div`
  margin-top: 1rem;
  white-space: pre-wrap;

  * {
    white-space: pre-wrap;
  }
`;
