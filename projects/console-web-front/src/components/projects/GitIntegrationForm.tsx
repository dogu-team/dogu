import { GithubFilled, GitlabOutlined } from '@ant-design/icons';
import { PROJECT_SCM_TYPE } from '@dogu-private/types';
import { Form, FormInstance, Input, Radio } from 'antd';
import { IoLogoBitbucket } from 'react-icons/io5';

export type GitIntegrationFormValues = {
  git: PROJECT_SCM_TYPE;
  token: string;
  repo: string;
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
            <Radio.Button value={PROJECT_SCM_TYPE.GITHUB}>
              <GithubFilled />
              &nbsp;GitHub
            </Radio.Button>
            <Radio.Button value={PROJECT_SCM_TYPE.GITLAB}>
              <GitlabOutlined />
              &nbsp;GitLab
            </Radio.Button>
            <Radio.Button value={PROJECT_SCM_TYPE.BITBUCKET}>
              <IoLogoBitbucket />
              &nbsp;Bitbucket
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      )}
      <Form.Item label="Token" name="token" required rules={[{ required: true, message: 'Input token' }]}>
        <Input placeholder="ghp_1234567890abcd" required />
      </Form.Item>
      <Form.Item label="Repository URL" name="repo" required rules={[{ required: true, message: 'Input repository' }]}>
        <Input placeholder="https://github.com/dogu-team/dogu.git" required />
      </Form.Item>
    </Form>
  );
};

export default GitIntegrationForm;
