import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProjectBase } from '@dogu-private/console';
import { Button, Divider } from 'antd';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import ConsoleBasicLayout from 'src/components/layouts/ConsoleBasicLayout';
import SdkIcon from 'src/components/tutorial/SdkIcon';
import { TutorialContext } from 'src/hooks/context/useTutorialContext';
import { TutorialSupportSdk, tutorialSupportSdkText } from 'src/resources/tutorials';
import { flexRowBaseStyle } from 'src/styles/box';
import { NextPageWithLayout } from '../../../../../../_app';
import { getProjectPageServerSideProps, ProjectServerSideProps } from '../../../../../../../src/ssr/project';
import { swrAuthFetcher } from '../../../../../../../src/api';
import { routineTutorialData } from '../../../../../../../src/resources/tutorials/routine';
import useRefresh from '../../../../../../../src/hooks/useRefresh';
import RoutineTutorial from '../../../../../../../src/components/tutorial/routine/RoutineTutorial';
import RoutineFrameworkSelectContainer from '../../../../../../../src/components/tutorial/routine/RoutineFrameworkSelectContainer';
import ConsoleLayout from '../../../../../../../src/components/layouts/ConsoleLayout';
import OrganizationSideBar from '../../../../../../../src/components/layouts/OrganizationSideBar';

const ProjectRoutineGetStartedPage: NextPageWithLayout<ProjectServerSideProps> = ({ project, organization, user }) => {
  const router = useRouter();
  const { data, mutate } = useSWR<ProjectBase>(
    `/organizations/${organization.organizationId}/projects/${project.projectId}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
      fallbackData: project,
    },
  );
  const { t } = useTranslation('tutorial');
  const sdk = router.query.sdk as TutorialSupportSdk | undefined;
  const isFrameworkSelected =
    !!sdk && Object.keys(routineTutorialData).includes(router.query.sdk as string) && !!router.query.framework;

  useRefresh(['onProjectScmUpdated'], () => mutate());

  return (
    <TutorialContext.Provider value={{ me: user, organization, project: data ?? project, updateProject: () => {} }}>
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
                    {t('backLinkTitle')}
                  </Button>
                </Link>
              </div>
              <StyledTitle>
                <Trans
                  i18nKey="tutorial:routineTutorialTitle"
                  components={{
                    icon: <SdkIcon sdk={sdk} size={28} />,
                    sdk: <>{tutorialSupportSdkText[sdk]}</>,
                  }}
                />
              </StyledTitle>
            </div>
            <div>
              <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/routines`}>
                <Button type="link">{t('closeTutorialLinkTitle')}</Button>
              </Link>
            </div>
          </HeaderContent>

          <Divider />

          <RoutineTutorial selectedSdk={router.query.sdk as TutorialSupportSdk} />

          <LinkBox>
            <div />
            <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/routines`}>
              <Button type="link">{t('closeTutorialLinkTitle')}</Button>
            </Link>
          </LinkBox>
        </Box>
      ) : (
        <CenteredBox>
          <RoutineFrameworkSelectContainer
            skipButton={
              <Link
                href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/routines`}
                access-id="skip-project-tutorial"
              >
                <Button type="link">{t('skipTutorialLinkTitle')}</Button>
              </Link>
            }
          />
        </CenteredBox>
      )}
    </TutorialContext.Provider>
  );
};

ProjectRoutineGetStartedPage.getLayout = (page) => {
  return (
    <ConsoleLayout sidebar={<OrganizationSideBar />} {...page.props}>
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<ProjectServerSideProps> = getProjectPageServerSideProps;

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
