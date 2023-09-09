import { ArrowLeftOutlined } from '@ant-design/icons';
import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { Button, Divider } from 'antd';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide } from 'src/api/project';
import ConsoleBasicLayout from 'src/components/layouts/ConsoleBasicLayout';
import RemoteFrameworkSelectContainer from 'src/components/tutorial/remote/RemoteFrameworkSelectContainer';
import RemoteTestTutorial from 'src/components/tutorial/remote/RemoteTestTutorial';
import SdkIcon from 'src/components/tutorial/SdkIcon';
import { TutorialContext } from 'src/hooks/context/useTutorialContext';
import { TutorialSupportSdk, tutorialSupportSdkText } from 'src/resources/tutorials';
import { flexRowBaseStyle } from 'src/styles/box';
import { checkUserVerifiedInServerSide } from 'src/utils/auth';
import { NextPageWithLayout } from '../../../../../_app';
import { remoteTutorialData } from '../../../../../../src/resources/tutorials/remote';
import Trans from 'next-translate/Trans';

interface ServerSideProps {
  organization: OrganizationBase;
  me: UserBase;
  project: ProjectBase;
}

const ProjectRemoteGetStartedPage: NextPageWithLayout<ServerSideProps> = ({ project, organization, me }) => {
  const router = useRouter();
  const sdk = router.query.sdk as TutorialSupportSdk | undefined;
  const isFrameworkSelected = !!sdk && Object.keys(remoteTutorialData).includes(router.query.sdk as string) && !!router.query.framework;
  const { t } = useTranslation('tutorial');

  return (
    <TutorialContext.Provider value={{ me, organization, project, updateProject: () => {} }}>
      <Head>
        <title>Remote tutorial - {project.name} | Dogu</title>
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
                  i18nKey="tutorial:remoteTestTutorialTitle"
                  components={{
                    icon: <SdkIcon sdk={sdk} size={28} />,
                    sdk: <>{tutorialSupportSdkText[sdk]}</>,
                  }}
                />
              </StyledTitle>
            </div>
            <div>
              <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/remotes`}>
                <Button type="link">{t('closeTutorialLinkTitle')}</Button>
              </Link>
            </div>
          </HeaderContent>

          <Divider />

          <RemoteTestTutorial selectedSdk={router.query.sdk as TutorialSupportSdk} />

          <LinkBox>
            <div />
            <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/remotes`}>
              <Button type="link">{t('closeTutorialLinkTitle')}</Button>
            </Link>
          </LinkBox>
        </Box>
      ) : (
        <CenteredBox>
          <RemoteFrameworkSelectContainer
            skipButton={
              <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/remotes`} access-id="skip-project-tutorial">
                <Button type="link">{t('skipTutorialLinkTitle')}</Button>
              </Link>
            }
          />
        </CenteredBox>
      )}
    </TutorialContext.Provider>
  );
};

ProjectRemoteGetStartedPage.getLayout = (page) => {
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

export default ProjectRemoteGetStartedPage;

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
