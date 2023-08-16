import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { DeviceId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
  const caseId = router.query.caseId as RecordTestCaseId | undefined;
  const stepId = router.query.step as RecordTestStepId | undefined;

  return (
    <DeviceStreamingLayout
      project={project}
      deviceId={deviceId}
      right={caseId ? <VisualTestingEditor /> : <VisualTestingEntry project={project} />}
      title="Visual Testing"
      screenViewer={<VisualTestingScreenViewer project={project} caseId={caseId} stepId={stepId} />}
      hideDeviceSelector
    />
  );
};

export default VisualTesting;
