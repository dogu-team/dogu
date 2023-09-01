import { RuntimeInfoResponse, RoutineStepBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';
import { isAxiosError } from 'axios';

import { swrAuthFetcher } from '../../api';
import { isPipelineInProgress } from '../../utils/pipeline';
import ErrorBox from '../common/boxes/ErrorBox';
import RuntimeProfiles from './RuntimeProfiles';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props {
  step: RoutineStepBase;
}

const StepProfileController = ({ step }: Props) => {
  const router = useRouter();
  const pipelineId = router.query.pipelineId;
  const jobId = router.query.jobId;
  const deviceJobId = router.query.deviceJobId;
  const { data, isLoading, error } = useSWR<RuntimeInfoResponse>(
    !isPipelineInProgress(step.status) &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${pipelineId}/jobs/${jobId}/device-jobs/${deviceJobId}/steps/${step.routineStepId}/runtime-info`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (!data || error) {
    return <ErrorBox title="Something went wrong" desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get step profile information'} />;
  }

  return (
    <RuntimeProfiles
      profileData={data}
      startedAt={step.inProgressAt ? moment(step.inProgressAt).toDate() : new Date()}
      endedAt={step.inProgressAt ? moment(step.completedAt).toDate() : new Date()}
    />
  );
};

export default StepProfileController;
