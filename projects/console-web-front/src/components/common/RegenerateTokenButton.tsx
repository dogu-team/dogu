import { Alert } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';

import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import DangerZone from '../common/boxes/DangerZone';
import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  regenerate: () => Promise<string>;
}

const RegenerateTokenButton = ({ regenerate }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const { t } = useTranslation('common');

  const handleConfirm = async () => {
    try {
      const token = await regenerate();
      setToken(token);
      sendSuccessNotification('Regenerated');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to regenerate.\n${getErrorMessage(e)}`);
      }
    }
  };

  const handleModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setToken(null);
    }
  };

  return (
    <DangerZone.Button
      modalTitle={t('regenerateAccessTokenConfirmModalTitle')}
      modalButtonTitle={t('regenerateAccessTokenConfirmModalButtonTitle')}
      modalContent={
        token ? (
          <div access-id="regen-token-success">
            <Alert message="API token has been regenerated." type="success" style={{ marginBottom: '1rem' }} />
            <TokenCopyInput value={token} />
          </div>
        ) : (
          <p>{t('regenerateAccessTokenConfirmModalContent')}</p>
        )
      }
      onConfirm={handleConfirm}
      persistOpen
      footer={token ? null : undefined}
      onOpenChange={handleModalOpenChange}
      buttonProps={{
        id: 'regen-token-confirm-btn',
      }}
      access-id="regen-token-btn"
    >
      {t('regenerateAccessTokenButtonTitle')}
    </DangerZone.Button>
  );
};

export default RegenerateTokenButton;
