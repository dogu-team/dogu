import { Button, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const TimeoutDocsModal: React.FC<Props> = ({ isOpen, close }) => {
  const { t } = useTranslation('license');

  return (
    <Modal open={isOpen} onCancel={close} footer={null} centered destroyOnClose title={t('timeoutModalTitle')}>
      <div>
        <p style={{ lineHeight: '1.5' }}>{t('timeoutModalContent')}</p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <a href="https://docs.dogutech.io" target="_blank">
          <Button type="primary" style={{ width: '100%' }}>
            {t('networkGuide')}
          </Button>
        </a>
      </div>
    </Modal>
  );
};

export default TimeoutDocsModal;
