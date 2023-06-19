import { DestBase, DeviceJobLogInfo, TestLogResponse } from '@dogu-private/console';
import { DestId, DEST_STATE } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { swrAuthFetcher } from 'src/api';
import LogContainer from 'src/components/pipelines/LogContainer';
import useSWR from 'swr';
import { Url } from 'url';
import { isDestEndedWithData } from '../../utils/pipeline';
import DestEmptyData from './DestEmptyData';

interface Props {
  dest: DestBase;
  logType: keyof TestLogResponse;
}

const DestLogController = ({ dest, logType }: Props) => {
  const router = useRouter();
  const { data, isLoading, error } = useSWR(
    isDestEndedWithData(dest.state) &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${router.query.deviceJobId}/steps/${dest.routineStepId}/dests/${dest.destId}/logs`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  const getLineLink = useCallback((item: DeviceJobLogInfo): Partial<Url> => {
    // return { pathname: router.pathname, query: { ...router.query, step: `${step.stepId}`, line: `${item.line}` } };
    return { pathname: router.pathname, query: { ...router.query } };
  }, []);

  if (!isDestEndedWithData(dest.state)) {
    return <DestEmptyData status={dest.state} />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || error) {
    return <div>Something went wrong...</div>;
  }

  return <LogContainer logs={data} logType={logType} selectedLine={Number(router.query.line) || undefined} getLineLink={getLineLink} />;
};

export default DestLogController;
