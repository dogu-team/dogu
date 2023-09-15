import { Button, Modal } from 'antd';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const TimeoutDocsModal: React.FC<Props> = ({ isOpen, close }) => {
  return (
    <Modal open={isOpen} onCancel={close} footer={null} centered destroyOnClose title={'Check your network'}>
      <div>
        <p style={{ lineHeight: '1.5' }}>
          It seems like we cannot check license status due to network timeout. Please check your network and try again.
        </p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <a href="https://docs.dogutech.io" target="_blank">
          <Button type="primary" style={{ width: '100%' }}>
            Go to docs
          </Button>
        </a>
      </div>
    </Modal>
  );
};

export default TimeoutDocsModal;
