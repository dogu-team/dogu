import { Alert, Button, Space } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

const RoutineGitIntegrationAlert: React.FC<{ isScmIntegrated: boolean }> = ({ isScmIntegrated }) => {
  const router = useRouter();

  if (isScmIntegrated) {
    return null;
  }

  return (
    <Alert
      type="warning"
      showIcon
      message="Your organization is not currently integrated with a Git repository. Routine execution is possible after Git integration."
      action={
        <Space direction="vertical">
          <Button
            type="primary"
            size="small"
            style={{ width: '100%' }}
            onClick={() => router.push(`/dashboard/${router.query.orgId}/settings`)}
          >
            Integrate
          </Button>
          <Link
            href="https://docs.dogutech.io/management/project/git-integration/"
            target="_blank"
            style={{ textDecoration: 'none' }}
          >
            <Button size="small">Documentation</Button>
          </Link>
        </Space>
      }
    />
  );
};

export default RoutineGitIntegrationAlert;
