import { GithubFilled, GitlabOutlined } from '@ant-design/icons';
import { OrganizationScmServiceType } from '@dogu-private/console';
import { Form, FormInstance, Input, Radio } from 'antd';
import { IoLogoBitbucket } from 'react-icons/io5';

export type GitIntegrationFormValues = {
  git: OrganizationScmServiceType;
  url: string;
  token: string;
};

interface Props {
  form: FormInstance<GitIntegrationFormValues>;
  hideType?: boolean;
}

const GitIntegrationForm = ({ form, hideType }: Props) => {
  return (
    <Form form={form} layout="vertical" name="git-integration">
      {!hideType && (
        <Form.Item label="Git service" name="git" required rules={[{ required: true, message: 'Select service' }]}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button value={OrganizationScmServiceType[0]}>
              <GithubFilled />
              &nbsp;GitHub
            </Radio.Button>
            <Radio.Button value={OrganizationScmServiceType[1]}>
              <IoLogoBitbucket />
              &nbsp;Bitbucket
            </Radio.Button>
            <Radio.Button value={OrganizationScmServiceType[2]}>
              <GitlabOutlined />
              &nbsp;GitLab
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      )}
      <Form.Item
        label="Organization(personal) url"
        name="url"
        required
        rules={[{ required: true, message: 'Please enter valid url', type: 'url' }]}
      >
        <Input placeholder="https://github.com/dogu-team" required type="url" />
      </Form.Item>
      <Form.Item label="Token" name="token" required rules={[{ required: true, message: 'Please enter token' }]}>
        <Input placeholder="ghp_1234567890abcd" required />
      </Form.Item>
    </Form>
  );
};

export default GitIntegrationForm;
