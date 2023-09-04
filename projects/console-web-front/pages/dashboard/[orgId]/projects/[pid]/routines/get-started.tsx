import { ArrowLeftOutlined } from '@ant-design/icons';
import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { Button, Divider } from 'antd';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide } from 'src/api/project';
import ConsoleBasicLayout from 'src/components/layouts/ConsoleBasicLayout';
import FrameworkSelectContainer from 'src/components/tutorial/FrameworkSelectContainer';
import SdkIcon from 'src/components/tutorial/SdkIcon';
import { TutorialContext } from 'src/hooks/useTutorialContext';
import { TutorialSupportSdk, tutorialSupportSdkText } from 'src/resources/tutorials';
import { flexRowBaseStyle } from 'src/styles/box';
import { checkUserVerifiedInServerSide } from 'src/utils/auth';
import { NextPageWithLayout } from '../../../../../_app';
import RoutineTutorial from '../../../../../../src/components/tutorial/routine/RoutineTutorial';
import { routineTutorialData } from '../../../../../../src/resources/tutorials/routine';
import { swrAuthFetcher } from '../../../../../../src/api';
import useRefresh from '../../../../../../src/hooks/useRefresh';

interface ServerSideProps {
  organization: OrganizationBase;
  me: UserBase;
  project: ProjectBase;
}

const ProjectRoutineGetStartedPage: NextPageWithLayout<ServerSideProps> = ({ project, organization, me }) => {
  const router = useRouter();
  const { data, mutate } = useSWR<ProjectBase>(`/organizations/${organization.organizationId}/projects/${project.projectId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
    fallbackData: project,
  });
  const sdk = router.query.sdk as TutorialSupportSdk | undefined;
  const isFrameworkSelected = !!sdk && Object.keys(routineTutorialData).includes(router.query.sdk as string) && !!router.query.framework;

  useRefresh(['onProjectScmUpdated'], () => mutate());

  return (
    <TutorialContext.Provider value={{ me, organization, project: data ?? project, updateProject: () => {} }}>
      <Head>
        <title>Routine tutorial - {project.name} | Dogu</title>
      </Head>
      {isFrameworkSelected ? (
        <Box>
          <HeaderContent>
            <div>
              <div style={{ marginLeft: '-.5rem' }}>
                <Link href={{ query: { orgId: organization.organizationId, pid: project.projectId } }} shallow>
                  <Button icon={<ArrowLeftOutlined />} type="link">
                    Back
                  </Button>
                </Link>
              </div>
              <StyledTitle>
                Quick start -&nbsp;
                <SdkIcon sdk={sdk} size={28} />
                &nbsp;
                {tutorialSupportSdkText[sdk]}
              </StyledTitle>
            </div>
            <div>
              <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/remotes`}>
                <Button type="link">Close tutorial</Button>
              </Link>
            </div>
          </HeaderContent>

          <Divider />

          <RoutineTutorial selectedSdk={router.query.sdk as TutorialSupportSdk} />

          <LinkBox>
            <div />
            <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/remotes`}>
              <Button type="link">Close tutorial</Button>
            </Link>
          </LinkBox>
        </Box>
      ) : (
        <CenteredBox>
          <FrameworkSelectContainer
            skipButton={
              <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/remotes`} access-id="skip-project-tutorial">
                <Button type="link">Skip tutorial</Button>
              </Link>
            }
          />
        </CenteredBox>
      )}
    </TutorialContext.Provider>
  );
};

ProjectRoutineGetStartedPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (context) => {
  const [organization, checkResult, project] = await Promise.all([getOrganizationInServerSide(context), checkUserVerifiedInServerSide(context), getProjectInServerSide(context)]);

  if (checkResult.redirect) {
    return checkResult;
  }

  return {
    props: {
      organization,
      me: checkResult.props.fallback['/registery/check'],
      project,
    },
  };
};

export default ProjectRoutineGetStartedPage;

const Box = styled.div`
  padding: 2rem;
  line-height: 1.5;
`;

const CenteredBox = styled(Box)`
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  background-color: ${(props) => props.theme.main.colors.blue6};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h1`
  ${flexRowBaseStyle}
  font-size: 1.5rem;
  font-weight: 600;
`;

const LinkBox = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: calc(max(20%, 220px) + 2rem + 1000px);
  padding-left: calc(max(20%, 220px) + 2rem);
`;
