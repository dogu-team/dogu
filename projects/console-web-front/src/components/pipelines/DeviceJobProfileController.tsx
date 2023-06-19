import { RoutineDeviceJobBase, RuntimeInfoResponse } from '@dogu-private/console';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';

import { swrAuthFetcher } from '../../api';
import { isPipelineInProgress } from '../../utils/pipeline';
import ErrorBox from '../common/boxes/ErrorBox';
import RuntimeProfiles from './RuntimeProfiles';

interface Props {
  deviceJob: RoutineDeviceJobBase;
}

const DeviceJobProfileController = ({ deviceJob }: Props) => {
  const router = useRouter();
  const pipelineId = router.query.pipelineId;
  const jobId = router.query.jobId;
  const { data, isLoading, error } = useSWR<RuntimeInfoResponse>(
    !isPipelineInProgress(deviceJob.status) &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${pipelineId}/jobs/${jobId}/device-jobs/${deviceJob.routineDeviceJobId}/runtime-info`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (!data || error) {
    return <ErrorBox title="Oops.." desc="Cannot get runtime info" />;
  }

  return (
    <div style={{ width: '100%' }}>
      <RuntimeProfiles
        profileData={data}
        startedAt={deviceJob.inProgressAt ? moment(deviceJob.inProgressAt).toDate() : new Date()}
        endedAt={deviceJob.inProgressAt ? moment(deviceJob.completedAt).toDate() : new Date()}
      />
    </div>
  );
};

export default DeviceJobProfileController;
