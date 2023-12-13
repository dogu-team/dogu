import { LoadingOutlined } from '@ant-design/icons';
import { RoutineDeviceJobBase } from '@dogu-private/console';
import { RoutinePipelineId, USER_VERIFICATION_STATUS } from '@dogu-private/types';
import { Collapse, Divider } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DeviceJobProfileController from 'src/components/pipelines/DeviceJobProfileController';
import DeviceJobSummary from 'src/components/pipelines/DeviceJobSummary';
import DeviceJobVideoController from 'src/components/pipelines/DeviceJobVideoController';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from 'src/api/index';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import PipelineJobLayout from 'src/components/layouts/PipelineJobLayout';
import DeviceJobLiveLogController from 'src/components/pipelines/DeviceJobLiveLogController';
import DeviceJobLiveProfileController from 'src/components/pipelines/DeviceJobLiveProfileController';
import StepListController from 'src/components/pipelines/StepListController';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import useAuthStore from 'src/stores/auth';
import useLivePipelineStore from 'src/stores/live-pipeline';
import { getErrorMessageFromAxios } from 'src/utils/error';
import { isPipelineInProgress } from 'src/utils/pipeline';
import { NextPageWithLayout } from '../../../../../../../../../../../_app';
import TitleWithBannerAndOption from '../../../../../../../../../../../../src/components/layouts/TitleWithBannerAndOption';
import MobileGameTestAutomationFreeTierTopBanner from '../../../../../../../../../../../../src/components/billing/MobileGameTestAutomationFreeTierTopBanner';
import { MobileGameTestAutomationParallelCounter } from '../../../../../../../../../../../../src/components/projects/AutomationParallelCounter';

const DeviceJobPage: NextPageWithLayout<ProjectServerSideProps> = ({ organization, project }) => {
  const router = useRouter();
  const me = useAuthStore((state) => state.me);
  const pipelineId = router.query.pipelineId;
  const jobId = router.query.jobId;
  const deviceJobId = router.query.deviceJobId;
  const { data, isLoading, error, mutate } = useSWR<RoutineDeviceJobBase>(
    `/organizations/${organization.organizationId}/projects/${project.projectId}/pipelines/${pipelineId}/jobs/${jobId}/device-jobs/${deviceJobId}`,
    swrAuthFetcher,
  );
  const liveDeviceJob = useLivePipelineStore(
    (state) =>
      state.pipeline?.routineJobs
        ?.find((job) => job.routineJobId === Number(jobId))
        ?.routineDeviceJobs?.find((deviceJob) => deviceJob.routineDeviceJobId === Number(deviceJobId)),
  );
  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (!data || error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot find device job'}
      />
    );
  }

  return (
    <>
      <Head>
        <title>
          Device job {data.device?.name} - {project.name} | Dogu
        </title>
      </Head>
      <Box>
        <HeadBox isVerified={me?.userAndVerificationToken?.status === USER_VERIFICATION_STATUS.VERIFIED}>
          <DeviceJobSummary deviceJob={liveDeviceJob ? { ...liveDeviceJob, device: data.device } : data} />
        </HeadBox>

        <Content>
          <ContentSection>
            <ContentSectionTitle>{t('routine:stepInfoContentTitle')}</ContentSectionTitle>
            <StepListController
              orgId={organization.organizationId}
              projectId={project.projectId}
              pipelineId={Number(pipelineId) as RoutinePipelineId}
              deviceJob={data}
            />
          </ContentSection>

          <Divider />

          <ContentSection>
            <ContentSectionTitle>{t('routine:deviceJobInfoContentTitle')}</ContentSectionTitle>

            {isPipelineInProgress((liveDeviceJob || data).status) ? (
              <Collapse
                bordered={false}
                defaultActiveKey={['profiles', 'live-logs']}
                style={{ backgroundColor: 'inherit' }}
              >
                <Collapse.Panel
                  header={<PannelHeader>{t('routine:deviceJobInfoProfileTitle')}</PannelHeader>}
                  key="profiles"
                >
                  <DeviceJobLiveProfileController deviceJob={liveDeviceJob ?? data} />
                </Collapse.Panel>
                <Collapse.Panel header={<PannelHeader>라이브 로그</PannelHeader>} key="live-logs">
                  <DeviceJobLiveLogController deviceJob={liveDeviceJob ?? data} />
                </Collapse.Panel>
              </Collapse>
            ) : (
              <Collapse
                bordered={false}
                defaultActiveKey={['video', 'profiles']}
                style={{ backgroundColor: 'inherit' }}
              >
                {(liveDeviceJob || data).record === 1 && (
                  <Collapse.Panel
                    header={<PannelHeader>{t('routine:deviceJobInfoVideoTitle')}</PannelHeader>}
                    key="video"
                  >
                    <DeviceJobVideoController deviceJob={liveDeviceJob ?? data} />
                  </Collapse.Panel>
                )}
                <Collapse.Panel
                  header={<PannelHeader>{t('routine:deviceJobInfoProfileTitle')}</PannelHeader>}
                  key="profiles"
                >
                  <DeviceJobProfileController deviceJob={liveDeviceJob ?? data} />
                </Collapse.Panel>
              </Collapse>
            )}
          </ContentSection>
        </Content>
      </Box>
    </>
  );
};

DeviceJobPage.getLayout = (page) => {
  return (
    <PipelineJobLayout
      {...page.props}
      title={
        <TitleWithBannerAndOption
          titleKey="organization:mobileGameAutomationPageTitle"
          banner={<MobileGameTestAutomationFreeTierTopBanner />}
          option={<MobileGameTestAutomationParallelCounter />}
        />
      }
    >
      {page}
    </PipelineJobLayout>
  );
};

export const getServerSideProps = getProjectPageServerSideProps;

export default DeviceJobPage;

const Box = styled.div`
  background-color: rgb(250, 250, 250);
  border-radius: 6px;
`;

const HeadBox = styled.div<{ isVerified?: boolean }>`
  position: sticky;
  height: 109px;
  top: -2rem;
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray3};
  background-color: inherit;
  z-index: 10;
`;

const Content = styled.div`
  padding: 1rem;
`;

const ContentSection = styled.div`
  margin: 1rem 0;
`;

const ContentSectionTitle = styled.p`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const PannelHeader = styled.div`
  font-weight: 600;
`;
