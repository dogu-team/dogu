import { Form, Input, Select } from 'antd';
import { AxiosError } from 'axios';

import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import DangerZone from '../common/boxes/DangerZone';

const GitIntegrationDangerButton = () => {
  const [form] = Form.useForm<{ git: string; token: string; repo: string; path: string }>();

  const handleConfirm = async () => {
    const values = await form.validateFields();

    try {
      sendSuccessNotification('Git integration changed');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification('Git integration change failed');
      }
    }
  };

  return (
    <DangerZone.Button
      modalTitle={'Change Git Integration'}
      modalContent={
        <Form form={form} layout="vertical">
          <Form.Item label="Git service" name="git" required rules={[{ required: true, message: 'Select service' }]}>
            <Select placeholder="Select service">
              <Select.Option value="github">GitHub</Select.Option>
              <Select.Option value="gitlab">GitLab</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Token" name="token" required rules={[{ required: true, message: 'Input token' }]}>
            <Input placeholder="ghp_1234567890abcd" required />
          </Form.Item>
          <Form.Item label="Repository" name="repo" required rules={[{ required: true, message: 'Input repository' }]}>
            <Input placeholder="dogu-team/dogu" required />
          </Form.Item>
          <Form.Item label="Dogu config path" name="path" required rules={[{ required: true, message: 'Input config path' }]}>
            <Input placeholder="./e2e" required />
          </Form.Item>
        </Form>
      }
      onConfirm={handleConfirm}
      modalButtonTitle={'Confirm and Change'}
      onOpenChange={() => {
        form.resetFields();
      }}
    >
      Change Git Integration
    </DangerZone.Button>
  );
};

export default GitIntegrationDangerButton;
