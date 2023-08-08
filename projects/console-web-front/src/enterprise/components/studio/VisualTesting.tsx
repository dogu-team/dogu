import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { DeviceStreamingLayoutProps } from '../../../components/studio/DeviceStreamingLayout';
import VisualTestingEditor from '../visual/VisualTestingEditor';
import VisualTestingEntry from './VisualTestingEntry';
import VisualTestingScreenViewer from './VisualTestingScreenViewer';
// @ts-ignore
const DeviceStreamingLayout = dynamic<DeviceStreamingLayoutProps>(() => import('../../../components/studio/DeviceStreamingLayout'), { ssr: false });

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
      right={caseId ? <VisualTestingEditor /> : <VisualTestingEntry project={project} />}
      title="Visual Testing"
      screenViewer={<VisualTestingScreenViewer />}
    />
  );
};

export default VisualTesting;
