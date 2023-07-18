import { RightOutlined } from '@ant-design/icons';
import { RoutineDeviceJobBase, RoutineJobBase } from '@dogu-private/console';
import { OrganizationId, RoutinePipelineId, PIPELINE_STATUS, ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useLivePipelineStore from '../../stores/live-pipeline';
import { flexRowBaseStyle } from '../../styles/box';
import { oneLineClampStyle } from '../../styles/text';
import PlatformIcon from '../device/PlatformIcon';
import ProjectSidebarItem from '../projects/ProjectSidebarItem';
import JobStatusIcon from './JobStatusIcon';

interface Props {
  orgId: OrganizationId;
  projectId: ProjectId;
  pipelineId: RoutinePipelineId;
  job: RoutineJobBase;
  expandable?: boolean;
}

const JobExpandableSidebarButton = ({ job, orgId, pipelineId, projectId, expandable = true }: Props) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(Number(router.query.jobId) === job.routineJobId);
  const { data, isLoading, error, mutate } = useSWR<RoutineDeviceJobBase[]>(
    expandable && expanded && `/organizations/${orgId}/projects/${projectId}/pipelines/${pipelineId}/jobs/${job.routineJobId}/device-jobs`,
    swrAuthFetcher,
  );
  const { t } = useTranslation();
  const liveJob = useLivePipelineStore((state) => state.pipeline?.routineJobs?.find((j) => j.routineJobId === job.routineJobId));

  const jobStatus = liveJob ? liveJob.status : job.status;

  return (
    <Box>
      {expandable ? (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          highlighted={Number(router.query.jobId) === job.routineJobId && !expanded}
        >
          <RightOutlined
            style={{
              marginRight: '0.25rem',
              transition: 'all 0.2s',
              transform: expanded ? 'rotate(90deg)' : 'none',
            }}
          />
          <JobStatusIcon status={jobStatus} />
          <p>{job.name}</p>
        </Button>
      ) : (
        <ProjectSidebarItem
          href={`/dashboard/${orgId}/projects/${projectId}/routines/${pipelineId}/jobs/${job.routineJobId}`}
          selected={Number(router.query.jobId) === job.routineJobId && router.query.deviceJobId === undefined}
        >
          <JobStatusIcon status={jobStatus} />
          <p style={{ marginLeft: '.25rem' }}>{job.name}</p>
        </ProjectSidebarItem>
      )}

      {expandable && expanded && (
        <DeviceJobContainer>
          <ProjectSidebarItem
            key={`job-${job.routineJobId}-summary`}
            href={`/dashboard/${orgId}/projects/${projectId}/routines/${pipelineId}/jobs/${job.routineJobId}`}
            selected={Number(router.query.jobId) === job.routineJobId && router.query.deviceJobId === undefined}
          >
            {t('routine:jobSummaryText')}
          </ProjectSidebarItem>
          {data?.map((item) => {
            const deviceJobStatus = liveJob ? liveJob.routineDeviceJobs?.find((deviceJob) => deviceJob.routineDeviceJobId === item.routineDeviceJobId)?.status : item.status;

            return (
              <ProjectSidebarItem
                key={`job-${job.routineJobId}-drj-${item.routineDeviceJobId}`}
                href={`/dashboard/${orgId}/projects/${projectId}/routines/${pipelineId}/jobs/${job.routineJobId}/device-jobs/${item.routineDeviceJobId}`}
                selected={Number(router.query.deviceJobId) === item.routineDeviceJobId}
              >
                <JobStatusIcon status={deviceJobStatus ?? PIPELINE_STATUS.UNSPECIFIED} />
                <FlexRowBox>
                  <PlatformIcon platform={item.device?.platform} />
                  <DeviceJobName>
                    {`(${item.device?.version}) `}
                    {item.device?.modelName}
                  </DeviceJobName>
                </FlexRowBox>
              </ProjectSidebarItem>
            );
          })}
        </DeviceJobContainer>
      )}
    </Box>
  );
};

export default React.memo(JobExpandableSidebarButton);

const Box = styled.div``;

const sidebarCSS = css`
  display: flex;
  width: 100%;
  padding: 8px 12px;
  color: #000;
  transition: all 0.2s;
  border-radius: 6px;
  align-items: center;
`;

const Button = styled.button<{ highlighted: boolean }>`
  ${sidebarCSS}
  background-color: ${(props) => (props.highlighted ? `${props.theme.colorPrimary}44` : '#fff')};

  &:hover {
    color: #000;
    background-color: ${(props) => props.theme.colors.gray2};
  }

  p {
    display: -webkit-box;
    width: 220px;
    margin-left: 0.25rem;
    text-align: left;
    line-height: 1.2;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
`;

const DeviceJobContainer = styled.div`
  border-left: 3px solid ${(props) => props.theme.colors.gray2};
  margin: 0.25rem 0 0.25rem 1rem;
  padding-left: 0.25rem;
`;

const DeviceJobName = styled.p`
  ${oneLineClampStyle}
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
  padding-left: 0.25rem;
`;
