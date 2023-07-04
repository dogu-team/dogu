import { GithubFilled, GitlabOutlined } from '@ant-design/icons';
import { Form, Input, Radio } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';

import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import DangerZone from '../common/boxes/DangerZone';

const GitIntegrationDangerButton = () => {
  const [form] = Form.useForm<{ git: string; token: string; repo: string; path: string }>();
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
          <Form form={form} layout="vertical" name="git-integration">
            <Form.Item label="Git service" name="git" required rules={[{ required: true, message: 'Select service' }]} valuePropName="checked">
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="github">
                  <GithubFilled />
                  &nbsp;GitHub
                </Radio.Button>
                <Radio.Button value="gitlab">
                  <GitlabOutlined />
                  &nbsp;GitLab
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Token" name="token" required rules={[{ required: true, message: 'Input token' }]}>
              <Input placeholder="ghp_1234567890abcd" required />
            </Form.Item>
            <Form.Item label="Repository" name="repo" required rules={[{ required: true, message: 'Input repository' }]}>
              <Input placeholder="dogu-team/dogu" required />
            </Form.Item>
            <Form.Item label="Dogu config file(json) path" name="path" required rules={[{ required: true, message: 'Input config path' }]}>
              <Input placeholder="e2e/dogu.config.json" required />
            </Form.Item>
          </Form>

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
