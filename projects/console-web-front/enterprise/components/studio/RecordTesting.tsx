import { DeviceBase, OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId, RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { DeviceStreamingLayoutProps } from '../../../src/components/studio/DeviceStreamingLayout';
import RecordTestingEditor from '../record/RecordTestingEditor';
import RecordTestingEntry from './RecordTestingEntry';
import RecordTestingScreenViewer from './RecordTestingScreenViewer';
const DeviceStreamingLayout = dynamic<DeviceStreamingLayoutProps>(
  // @ts-ignore
  () => import('../../../src/components/studio/DeviceStreamingLayout'),
  { ssr: false },
);

interface Props {
  organization: OrganizationBase;
  project: ProjectBase;
  device: DeviceBase;
  me: UserBase;
}

const RecordTesting = ({ organization, me, project, device }: Props) => {
  const router = useRouter();
  const caseId = router.query.caseId as RecordTestCaseId | undefined;
  const stepId = router.query.step as RecordTestStepId | undefined;

  return (
    <DeviceStreamingLayout
      organization={organization}
      device={device}
      right={caseId ? <RecordTestingEditor /> : <RecordTestingEntry project={project} />}
      title="Record Testing"
      screenViewer={<RecordTestingScreenViewer project={project} caseId={caseId} stepId={stepId} />}
      hideDeviceSelector
      userId={me.userId}
    />
  );
};

export default RecordTesting;
