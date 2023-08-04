import { RoutineBase } from '@dogu-private/console';
import { Button } from 'antd';
import Image from 'next/image';

interface Props {
  routine?: RoutineBase;
}

const JenkinsButton = ({ routine }: Props) => {
  if (routine) {
    return null;
  }

  return (
    <Button
      href={'https://docs.dogutech.io/integration/cicd/jenkins'}
      target="_blank"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '.5rem',
      }}
      icon={<Image src="/resources/icons/jenkins-logo.svg" alt="Jenkins" width={16} height={16} />}
    >
      <p style={{ marginLeft: '8px' }}>Jenkins</p>
    </Button>
  );
};

export default JenkinsButton;
