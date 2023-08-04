import { RoutineBase } from '@dogu-private/console';
import { Button } from 'antd';
import Image from 'next/image';

interface Props {
  routine?: RoutineBase;
}

const GithubActionButton = ({ routine }: Props) => {
  if (!routine) {
    return null;
  }

  return (
    <Button
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '.5rem',
      }}
      icon={<Image src="/resources/icons/github-action-logo.svg" alt="Github Action" width={16} height={16} />}
    >
      <p style={{ marginLeft: '8px' }}>Github Action</p>
    </Button>
  );
};

export default GithubActionButton;
