import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import DeviceStreamingLayout from '../../../components/studio/DeviceStreamingLayout';
import VisualTestingEntry from './VisualTestingEntry';
import VisualTestingScreenViewer from './VisualTestingScreenViewer';

interface Props {
  organization: OrganizationBase;
  project: ProjectBase;
  deviceId: DeviceId;
}

const VisualTesting = ({ organization, project, deviceId }: Props) => {
  const router = useRouter();
  const caseId = router.query.caseId as string | undefined;

  return (
    <DeviceStreamingLayout
      project={project}
      deviceId={deviceId}
      right={caseId ? <div>Editor</div> : <VisualTestingEntry project={project} />}
      title="Visual Testing"
      screenViewer={<VisualTestingScreenViewer />}
    />
  );
};

export default VisualTesting;
