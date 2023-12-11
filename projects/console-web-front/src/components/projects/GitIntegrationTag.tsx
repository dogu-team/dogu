import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import { useRouter } from 'next/router';

import GitIcon from 'public/resources/icons/git-logo.svg';

interface Props {
  isScmIntegrated: boolean;
}

const GitIntegrationTag = ({ isScmIntegrated }: Props) => {
  const router = useRouter();

  return (
    <Tooltip title={isScmIntegrated ? 'Git is integrated' : 'Click here for integrating with Git'}>
      <Tag
        color={isScmIntegrated ? 'green' : 'warning'}
        icon={isScmIntegrated ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        onClick={() => {
          if (!isScmIntegrated) {
            router.push(`/dashboard/${router.query.orgId}/settings`);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isScmIntegrated ? 'default' : 'pointer',
          minWidth: '36px',
          minHeight: '24px',
        }}
      >
        <GitIcon style={{ display: 'flex', width: '16px', height: '16px' }} />
      </Tag>
    </Tooltip>
  );
};

export default GitIntegrationTag;
