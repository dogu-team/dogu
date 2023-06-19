import { Button, FormInstance, Modal, ModalProps } from 'antd';
import { useEffect, useState } from 'react';

interface Props extends Omit<ModalProps, 'onCancel' | 'onOk'> {
  form: React.ReactNode;
  formId: string;
  close: () => void;
}

const FormControlModal = ({ form, formId, close, ...modalProps }: Props) => {
  return (
    <Modal
      {...modalProps}
      onCancel={close}
      footer={
        modalProps.footer !== undefined ? (
          modalProps.footer
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={close}>{modalProps.cancelText ?? 'Cancel'}</Button>
            <Button type="primary" htmlType="submit" form={formId} loading={modalProps.confirmLoading}>
              {modalProps.okText ?? 'Ok'}
            </Button>
          </div>
        )
      }
    >
      {form}
    </Modal>
  );
};

export default FormControlModal;
