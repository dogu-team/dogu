import { Button, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { DoguDocsUrl } from '../../../src/utils/url';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const TimeoutDocsModal: React.FC<Props> = ({ isOpen, close }) => {
  const { t } = useTranslation('billing');

  return (
    <Modal open={isOpen} onCancel={close} footer={null} centered destroyOnClose title={t('timeoutModalTitle')}>
      <div>
        <p style={{ lineHeight: '1.5' }}>{t('timeoutModalContent')}</p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <a href={DoguDocsUrl['get-started'].installation['self-hosted'].license()} target="_blank">
          <Button type="primary" style={{ width: '100%' }}>
            {t('visitGuide')}
          </Button>
        </a>
      </div>
    </Modal>
  );
};

export default TimeoutDocsModal;
