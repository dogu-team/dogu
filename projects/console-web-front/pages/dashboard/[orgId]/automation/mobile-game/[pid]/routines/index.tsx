import styled from 'styled-components';
import { useRouter } from 'next/router';
import { RoutineId } from '@dogu-private/types';
import useSWR from 'swr';
import { ProjectSlackRoutineBase, RoutineBase } from '@dogu-private/console';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Image from 'next/image';

import { NextPageWithLayout } from 'pages/_app';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import PipelineListController from 'src/components/pipelines/PipelineListController';
import TableListView from 'src/components/common/TableListView';
import RefreshButton from 'src/components/buttons/RefreshButton';
import RoutineSideBar from 'src/components/pipelines/RoutineSideBar';
import PipelineFilter from 'src/components/pipelines/PipelineFilter';
import RunRoutineButton from 'src/components/pipelines/RunRoutineButton';
import RoutineInfoContainer from 'src/components/routine/RoutineInfoContainer';
import { swrAuthFetcher } from 'src/api/index';
import EditRoutineButton from 'src/components/routine/EditRoutineButton';
import ExternalGuideLink from 'src/components/common/ExternalGuideLink';
import SlackRoutineChannelButton from 'enterprise/components/slack/SlackRoutineChannelButton';
import AutomationLayout from '../../../../../../../src/components/layouts/AutomationLayout';
import TutorialButton from '../../../../../../../src/components/buttons/TutorialButton';
import { isOrganizationScmIntegrated } from '../../../../../../../src/utils/organization';
import { DoguDocsUrl } from '../../../../../../../src/utils/url';

const ProjectRoutinePage: NextPageWithLayout<ProjectServerSideProps> = ({ organization, project }) => {
  const router = useRouter();
  const routineId = router.query.routine as RoutineId | undefined;
  const { data: routine } = useSWR<RoutineBase>(
    routineId && `/organizations/${organization.organizationId}/projects/${project.projectId}/routines/${routineId}`,
    swrAuthFetcher,
  );
  const { data: routineSlack } = useSWR<ProjectSlackRoutineBase>(
    routineId &&
      `/organizations/${organization.organizationId}/projects/${project.projectId}/slack/routine/${routineId}`,
    swrAuthFetcher,
  );

  return (
    <>
      <Head>
        <title>Routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        <PipelineContainer>
          <TableListView
            top={
              <PipelineTopBox>
                <RoutineInfoContainer
                  orgId={organization.organizationId}
                  projectId={project.projectId}
                  routine={routine}
                />

                <PipelineTopButtonWrapper>
                  <RowFlexBox>
                    {/* <TutorialButton
                      href={`/dashboard/${organization.organizationId}/automation/mobile-game/${project.projectId}/routines/get-started`}
                      style={{ marginRight: '.5rem' }}
                    /> */}
                    <RunRoutineButton
                      orgId={organization.organizationId}
                      projectId={project.projectId}
                      routine={routine}
                    />
                    <EditRoutineButton
                      orgId={organization.organizationId}
                      projectId={project.projectId}
                      routine={routine}
                    />
                    <PipelineFilter />
                    {routine && routineId && (
                      <SlackRoutineChannelButton
                        organizationId={organization.organizationId}
                        projectId={project.projectId}
                        routineId={routineId}
                        routineSlack={routineSlack}
                      />
                    )}
                    {!routine && (
                      <>
                        <ExternalGuideLink
                          href={DoguDocsUrl.integration.cicd['github-action']()}
                          icon={
                            <Image
                              src="/resources/icons/github-action-logo.svg"
                              alt="Github Action"
                              width={16}
                              height={16}
                            />
                          }
                        >
                          GitHub Action
                        </ExternalGuideLink>
                        <ExternalGuideLink
                          href={DoguDocsUrl.integration.cicd.jenkins()}
                          icon={<Image src="/resources/icons/jenkins-logo.svg" alt="Jenkins" width={16} height={16} />}
                        >
                          Jenkins
                        </ExternalGuideLink>
                      </>
                    )}
                  </RowFlexBox>
                  <RefreshButton />
                </PipelineTopButtonWrapper>
              </PipelineTopBox>
            }
            table={
              <PipelineListController organizationId={organization.organizationId} projectId={project.projectId} />
            }
          />
        </PipelineContainer>
      </Box>
    </>
  );
};

ProjectRoutinePage.getLayout = (page) => {
  return (
    <AutomationLayout
      {...page.props}
      innerSidebar={<RoutineSideBar isScmIntegrated={isOrganizationScmIntegrated(page.props.organization)} />}
      titleI18nKey="organization:mobileGameAutomationPageTitle"
    >
      {page}
    </AutomationLayout>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default ProjectRoutinePage;

const Box = styled.div``;

const PipelineTopBox = styled.div``;

const PipelineTopButtonWrapper = styled.div`
  display: flex;
  margin-top: 1rem;
  justify-content: space-between;
  align-items: center;
`;

const PipelineContainer = styled.div`
  flex: 1;
`;

const RowFlexBox = styled.div`
  display: flex;
  align-items: center;
`;
