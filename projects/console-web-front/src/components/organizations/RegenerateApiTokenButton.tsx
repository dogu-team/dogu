import { OrganizationId } from '@dogu-private/types';
import { Alert } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { mutate } from 'swr';

import { regenerateApiToken } from '../../api/organization';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import DangerZone from '../common/boxes/DangerZone';
import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  organizationId: OrganizationId;
}

const RegenerateApiTokenButton = ({ organizationId }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const { t } = useTranslation('organization');

  const handleConfirm = async () => {
    try {
      const data = await regenerateApiToken(organizationId);
      mutate(`/organizations/${organizationId}/api-token`, data, false);
      setToken(data);
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
      modalTitle={t('settingRegenerateApiTokenButtonTitle')}
      modalButtonTitle={t('settingRegenerateApiTokenConfirmModalButtonTitle')}
      modalContent={
        token ? (
          <div>
            <Alert message="API token has been regenerated." type="success" style={{ marginBottom: '1rem' }} />
            <TokenCopyInput value={token} />
          </div>
        ) : (
          <p>{t('settingRegenerateApiTokenConfirmModalContent')}</p>
        )
      }
      onConfirm={handleConfirm}
      persistOpen
      footer={token ? null : undefined}
      onOpenChange={handleModalOpenChange}
    >
      {t('settingRegenerateApiTokenButtonTitle')}
    </DangerZone.Button>
  );
};

export default RegenerateApiTokenButton;
