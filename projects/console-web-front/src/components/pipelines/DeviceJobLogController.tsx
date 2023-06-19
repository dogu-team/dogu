import { RoutineDeviceJobBase, TestLogResponse } from '@dogu-private/console';
import { DeviceJobLogInfo } from '@dogu-private/console';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import useSWR from 'swr';
import { Url } from 'url';

import { swrAuthFetcher } from '../../api';
import { isPipelineInProgress } from '../../utils/pipeline';
import LogContainer from './LogContainer';

interface Props {
  deviceJob: RoutineDeviceJobBase;
  logType: keyof TestLogResponse;
}

const DeviceJobLogController = ({ deviceJob, logType }: Props) => {
  const router = useRouter();
  const { data, isLoading, error } = useSWR<TestLogResponse>(
    !isPipelineInProgress(deviceJob.status) &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${deviceJob.routineDeviceJobId}/logs`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  const getLineLink = useCallback(
    (item: DeviceJobLogInfo): Partial<Url> => {
      return { pathname: router.pathname, query: { ...router.query, test: undefined, step: undefined, line: `${item.line}` } };
    },
    [router.pathname, router.query],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || error) {
    return <div>Something went wrong...</div>;
  }

  return <LogContainer logs={data} logType={logType} selectedLine={Number(router.query.line) || undefined} getLineLink={getLineLink} />;
};

export default DeviceJobLogController;
