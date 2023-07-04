import { Form } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';

import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import DangerZone from '../common/boxes/DangerZone';
import GitIntegrationForm, { GitIntegrationFormValues } from './GitIntegrationForm';

const GitIntegrationDangerButton = () => {
  const [form] = Form.useForm<GitIntegrationFormValues>();
  const { t } = useTranslation('project');

  const handleConfirm = async () => {
    const values = await form.validateFields();

    try {
      sendSuccessNotification(t('projectUpdateSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('projectUpdateFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  return (
    <DangerZone.Button
      modalTitle={t('editGitIntegrationConfirmModalTitle')}
      modalContent={
        <div>
          <GitIntegrationForm form={form} />
          <p style={{ marginTop: '.5rem' }}>{t('settingEditGitIntegrationConfirmContent')}</p>
        </div>
      }
      onConfirm={handleConfirm}
      modalButtonTitle={'Confirm and Change'}
      onOpenChange={() => {
        form.resetFields();
      }}
    >
      {t('editGitIntegrationConfirmModalButtonText')}
    </DangerZone.Button>
  );
};

export default GitIntegrationDangerButton;
