import { RoutineBase } from '@dogu-private/console';
import { Button } from 'antd';
import Image from 'next/image';

interface Props {
  routine?: RoutineBase;
}

const ProjectApplicationAPIButton = ({ routine }: Props) => {
  return (
    <Button
      href="https://docs.dogutech.io/api/project/application#upload-application"
      target="_blank"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '.5rem',
      }}
      icon={<Image src="/resources/icons/api-logo.svg" alt="API" width={16} height={16} />}
    >
      <p style={{ marginLeft: '8px' }}>API</p>
    </Button>
  );
};

export default ProjectApplicationAPIButton;
