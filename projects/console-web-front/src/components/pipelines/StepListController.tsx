import { FieldTimeOutlined, LinkOutlined, LoadingOutlined, RightOutlined } from '@ant-design/icons';
import { DestBase, RoutineDeviceJobBase, RoutineStepBase } from '@dogu-private/console';
import { DEST_TYPE, DeviceId, OrganizationId, RoutinePipelineId, PIPELINE_STATUS, ProjectId, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { message, Tabs, TabsProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useRefresh from '../../hooks/useRefresh';
import useAuthStore from '../../stores/auth';
import useLivePipelineStore from '../../stores/live-pipeline';
import useStepLogsStore from '../../stores/step-logs';
import { ResultTabMenuItemType, ResultTabMenuKey } from '../../types/routine';
import { isPipelineEndedWithData, isPipelineInProgress } from '../../utils/pipeline';
import ErrorBox from '../common/boxes/ErrorBox';
import DestJob from './DestJob';
import DestUnit from './DestUnit';
import JobStatusIcon from './JobStatusIcon';
import PipelineRuntime from './PipelineRuntime';
import StepLogController from './StepLogController';
import StepProfileController from './StepProfileController';

interface ItemProps {
  step: RoutineStepBase;
  deviceId: DeviceId;
}

const StepItem = React.memo(({ step, deviceId }: ItemProps) => {
  const router = useRouter();
  const me = useAuthStore((state) => state.me);
  const [isOpen, setIsOpen] = useState(
    router.query.step
      ? Number(router.query.step) === step.routineStepId || step.status === PIPELINE_STATUS.IN_PROGRESS
      : step.status === PIPELINE_STATUS.FAILURE || step.status === PIPELINE_STATUS.IN_PROGRESS,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    data: destData,
    isLoading: destLoading,
    error: destError,
  } = useSWR<DestBase[]>(
    isOpen &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/pipelines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${router.query.deviceJobId}/steps/${step.routineStepId}/dests`,
    swrAuthFetcher,
    {
      keepPreviousData: true,
    },
  );

  const liveDestData = useLivePipelineStore(
    (state) =>
      state.pipeline?.routineJobs
        ?.find((j) => j.routineJobId === Number(router.query.jobId))
        ?.routineDeviceJobs?.find((dj) => dj.routineDeviceJobId === Number(router.query.deviceJobId))
        ?.routineSteps?.find((s) => s.routineStepId === step.routineStepId)?.dests,
  );
  const { t } = useTranslation();

  const data = liveDestData || destData;
  const hasDest = !!data?.length;
  const openable = hasDest || isPipelineEndedWithData(step.status);

  useEffect(() => {
    if (Number(router.query.step) === step.routineStepId || step.status === PIPELINE_STATUS.IN_PROGRESS || step.status === PIPELINE_STATUS.FAILURE) {
      setIsOpen(true);
      setTimeout(() => {
        buttonRef.current?.scrollIntoView();
      }, 600);
    }
  }, []);

  const commonItems: ResultTabMenuItemType = isPipelineEndedWithData(step.status)
    ? [
        {
          key: ResultTabMenuKey.TEST_LOGS,
          label: t('routine:resultTabScriptLogMenuTitle'),
          children: <StepLogController step={step} logType="userProjectLogs" />,
        },
        {
          key: ResultTabMenuKey.DEVICE_LOGS,
          label: t('routine:resultTabDeviceLogMenuTitle'),
          children: <StepLogController step={step} logType="deviceLogs" />,
        },
        {
          key: ResultTabMenuKey.PROFILE,
          label: t('routine:resultTabDeviceProfileMenuTitle'),
          children: <StepProfileController step={step} />,
        },
      ]
    : [];

  const items: ResultTabMenuItemType = hasDest
    ? [
        {
          key: ResultTabMenuKey.TESTS,
          label: t('routine:resultTabTestMenuTitle'),
          children: (
            <div>
              {data.map((item) => {
                switch (item.type) {
                  case DEST_TYPE.JOB:
                    return <DestJob key={`job-${item.destId}`} destJob={item} />;
                  case DEST_TYPE.UNIT:
                    return <DestUnit key={`unit-${item.destId}`} destUnit={item} />;
                  default:
                    return null;
                }
              })}
            </div>
          ),
        },
        ...commonItems,
      ]
    : commonItems;

  return (
    <Item>
      <StepHeader
        onClick={(e) => {
          if (openable) {
            e.stopPropagation();
            setIsOpen((prev) => {
              if (prev) {
                router.push(
                  `/dashboard/${router.query.orgId}/projects/${router.query.pid}/routines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${router.query.deviceJobId}`,
                  undefined,
                  { shallow: true, scroll: false },
                );
              } else {
                router.push(
                  `/dashboard/${router.query.orgId}/projects/${router.query.pid}/routines/${router.query.pipelineId}/jobs/${router.query.jobId}/device-jobs/${router.query.deviceJobId}?step=${step.routineStepId}`,
                  undefined,
                  { shallow: true, scroll: false },
                );
              }
              return !prev;
            });
          }
        }}
        ref={buttonRef}
        isOpen={step.status === PIPELINE_STATUS.IN_PROGRESS || isOpen}
        isVerified={me?.userAndVerificationToken?.status === USER_VERIFICATION_STATUS.VERIFIED}
      >
        <FlexRowBox>
          {openable && <RightOutlined style={{ marginRight: '1rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'all .2s' }} />}
          <JobStatusIcon status={step.status} />
          <Name>{step.name}</Name>
        </FlexRowBox>
        <FlexRowBox>
          <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
          <PipelineRuntime status={step.status} startedAt={step.inProgressAt && new Date(step.inProgressAt)} endedAt={step.completedAt && new Date(step.completedAt)} />
        </FlexRowBox>
      </StepHeader>

      {isOpen &&
        (destLoading ? (
          <StepBody>
            <LoadingOutlined />
          </StepBody>
        ) : (
          <StepBody>
            <Tabs
              defaultActiveKey={router.query.menu as ResultTabMenuKey}
              items={items}
              destroyInactiveTabPane
              onChange={(key) =>
                router.push({ pathname: router.pathname, query: { ...router.query, line: undefined, menu: key, step: step.routineStepId } }, undefined, {
                  shallow: true,
                  scroll: false,
                })
              }
            />
          </StepBody>
        ))}
    </Item>
  );
});

StepItem.displayName = 'StepItem';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
  deviceJob: RoutineDeviceJobBase;
}

const StepListController = ({ orgId, projectId, pipelineId, deviceJob }: Props) => {
  const { data, error, isLoading, mutate } = useSWR<RoutineStepBase[]>(
    `/organizations/${orgId}/projects/${projectId}/pipelines/${pipelineId}/jobs/${deviceJob.routineJobId}/device-jobs/${deviceJob.routineDeviceJobId}/steps`,
    swrAuthFetcher,
  );
  const liveSteps = useLivePipelineStore(
    (state) =>
      state.pipeline?.routineJobs
        ?.find((job) => job.routineJobId === deviceJob.routineJobId)
        ?.routineDeviceJobs?.find((dj) => dj.routineDeviceJobId === deviceJob.routineDeviceJobId)?.routineSteps,
  );

  if (isLoading) {
    return (
      <Box>
        <LoadingOutlined />
      </Box>
    );
  }

  if (!data || error) {
    return <ErrorBox title="Something went wrong..." desc="" />;
  }

  return (
    <Box>
      {(liveSteps || data).map((item) => {
        return <StepItem key={`steps-${item.routineStepId}`} step={item} deviceId={deviceJob.deviceId} />;
      })}
    </Box>
  );
};

export default StepListController;

const Box = styled.div`
  min-height: 500px;

  scroll-behavior: auto;
`;

const CopyButton = styled.button`
  display: none;
  width: 20px;
  height: 20px;
  border-radius: 2px;
  margin-left: 0.25rem;
  color: #000;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.gray2};

  &:hover {
    background-color: ${(props) => props.theme.colors.gray3};
  }
`;

const Item = styled.div``;

const StepHeader = styled.button<{ isOpen: boolean; isVerified?: boolean }>`
  position: sticky;
  top: 109px;
  display: flex;
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  color: #000;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => (props.isOpen ? props.theme.colors.gray2 : 'rgb(250, 250, 250)')};
  z-index: 1;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2};

    ${CopyButton} {
      display: flex;
    }
  }
`;

const FlexRowBox = styled.div`
  display: flex;
  align-items: center;
`;

const Name = styled.p`
  margin-left: 0.25rem;
`;

const StepBody = styled.div`
  /* width: calc(100vw - 420px); */
  /* overflow: hidden; */
  padding: 0 1rem 1rem 1rem;
`;
