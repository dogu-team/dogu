import { RoutineStepBase, TestLogResponse } from '@dogu-private/console';
import { DeviceJobLogInfo } from '@dogu-private/console';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { Url } from 'url';

import { swrAuthFetcher } from '../../api';
import { getErrorMessageFromAxios } from '../../utils/error';
import { isPipelineInProgress } from '../../utils/pipeline';
import ErrorBox from '../common/boxes/ErrorBox';
import LogContainer from './LogContainer';

interface Props {
  step: RoutineStepBase;
  logType: keyof TestLogResponse;
}

const StepLogController = ({ step, logType }: Props) => {
  const router = useRouter();
  const { data, isLoading, error } = useSWR<TestLogResponse>(
    !isPipelineInProgress(step.status) &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${router.query.deviceJobId}/steps/${step.routineStepId}/logs`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  const getLineLink = useCallback(
    (item: DeviceJobLogInfo): Partial<Url> => {
      return {
        pathname: router.pathname,
        query: { ...router.query, step: `${step.routineStepId}`, line: `${item.line}` },
      };
    },
    [router.pathname, router.query, step.routineStepId],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot find step log information'}
      />
    );
  }

  return (
    <LogContainer
      logs={data}
      logType={logType}
      selectedLine={Number(router.query.line) || undefined}
      getLineLink={getLineLink}
    />
  );
};

export default StepLogController;
