import { CheckCircleOutlined, ExclamationCircleOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { RoutineDeviceJobBase, RoutineJobBase } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { Skeleton } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../../../../../../../src/api/index';
import ErrorBox from '../../../../../../../../../src/components/common/boxes/ErrorBox';
import PipelineJobLayout from '../../../../../../../../../src/components/layouts/PipelineJobLayout';
import DeviceJobListController from '../../../../../../../../../src/components/pipelines/DeviceJobListController';
import JobStatusIcon from '../../../../../../../../../src/components/pipelines/JobStatusIcon';
import PipelineEmptyLog from '../../../../../../../../../src/components/pipelines/PipelineEmptyLog';
import PipelineRuntime from '../../../../../../../../../src/components/pipelines/PipelineRuntime';
import { getProjectPageServerSideProps, ProjectServerSideProps } from '../../../../../../../../../src/hoc/withProject';
import useLivePipelineStore from '../../../../../../../../../src/stores/live-pipeline';
import { pipelineJobEmptyText } from '../../../../../../../../../src/utils/mapper';
import { isPipelineEmptyLogStatus } from '../../../../../../../../../src/utils/pipeline';
import { NextPageWithLayout } from '../../../../../../../../_app';

const JobSummaryPage: NextPageWithLayout<ProjectServerSideProps> = ({ organization, project }) => {
  const router = useRouter();
  const pipelineId = Number(router.query.pipelineId);
  const jobId = Number(router.query.jobId);
  const {
    data: job,
    isLoading: isJobLoading,
    error: jobError,
    mutate,
  } = useSWR<RoutineJobBase>(`/organizations/${organization.organizationId}/projects/${project.projectId}/pipelines/${pipelineId}/jobs/${jobId}`, swrAuthFetcher);
  const { t } = useTranslation();
  const liveJob = useLivePipelineStore((state) => state.pipeline?.routineJobs?.find((item) => item.routineJobId === jobId));

  if (isNaN(pipelineId) || isNaN(jobId)) {
    return <ErrorBox title="Something went wrong" desc="" />;
  }

  if (isJobLoading) {
    return (
      <JobBox>
        <Skeleton active />
      </JobBox>
    );
  }

  if (!job || jobError) {
    return <ErrorBox title="Something went wrong" desc="Cannot find job." />;
  }

  const data = liveJob || job;

  const successJobCount = data.routineDeviceJobs?.filter((item) => item.status === PIPELINE_STATUS.SUCCESS).length;
  const failedJobCount = data.routineDeviceJobs?.filter((item) => item.status === PIPELINE_STATUS.FAILURE).length;

  return (
    <>
      <Head>
        <title>
          Job {job.name} - {project.name} | Dogu
        </title>
      </Head>
      <div>
        <div>
          <JobBox>
            <FlexRowBox>
              <JobStatusIcon status={data.status} />
              <JobName>{data.name}</JobName>
            </FlexRowBox>

            <FlexRowBox>
              {data.routineDeviceJobs && data.routineDeviceJobs.length > 0 && (
                <Statistics>
                  <StatisticContent>
                    <CheckCircleOutlined style={{ color: 'green', marginRight: '.25rem' }} />
                    {successJobCount ?? 0}&nbsp;
                    {successJobCount !== undefined && (successJobCount > 1 ? t('routine:deviceJobSuccessPlurarText') : t('routine:deviceJobSuccessSingularText'))}
                    &nbsp;
                    {`(${(((successJobCount ?? 0) / data.routineDeviceJobs.length) * 100).toFixed()}%)`}
                  </StatisticContent>
                  <StatisticContent>
                    <ExclamationCircleOutlined style={{ color: 'red', marginRight: '.25rem' }} />
                    {failedJobCount ?? 0}&nbsp;
                    {successJobCount !== undefined && (successJobCount > 1 ? t('routine:deviceJobFailurePlularText') : t('routine:deviceJobFailureSingularText'))}
                    &nbsp;
                    {`(${(((failedJobCount ?? 0) / data.routineDeviceJobs.length) * 100).toFixed(1)}%)`}
                  </StatisticContent>
                </Statistics>
              )}
              <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
              <PipelineRuntime status={data.status} startedAt={data.inProgressAt && new Date(data.inProgressAt)} endedAt={data.completedAt && new Date(data.completedAt)} />
            </FlexRowBox>
          </JobBox>
        </div>

        <DeviceJobBox>
          <DeviceJobDescTitle>{t('routine:deviceJobTitle')}</DeviceJobDescTitle>
          {isPipelineEmptyLogStatus(data.status) ? (
            <PipelineEmptyLog status={data.status} title={pipelineJobEmptyText[data.status] ?? 'Empty'} />
          ) : (
            <DeviceJobListController orgId={organization.organizationId} projectId={project.projectId} pipelineId={pipelineId} jobId={jobId} />
          )}
        </DeviceJobBox>
      </div>
    </>
  );
};

JobSummaryPage.getLayout = (page) => {
  return <PipelineJobLayout {...page.props}>{page}</PipelineJobLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default JobSummaryPage;

const JobBox = styled.div`
  display: flex;
  padding: 1rem;
  margin-top: 0.5rem;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.gray2};
  align-items: center;
  justify-content: space-between;
`;

const FlexRowBox = styled.div`
  display: flex;
  align-items: center;
`;

const JobName = styled.p`
  margin-left: 0.5rem;
  font-size: 1.05rem;
  font-weight: 500;
`;

const DeviceJobBox = styled.div`
  margin-left: 1rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0 0.5rem 1.5rem;
  border-left: 3px solid ${(props) => props.theme.colors.gray2};
`;

const DeviceJobDescTitle = styled.p`
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
`;

const Statistics = styled.div`
  width: 150px;
  margin-right: 0.5rem;
`;

const StatisticContent = styled.p`
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
`;
