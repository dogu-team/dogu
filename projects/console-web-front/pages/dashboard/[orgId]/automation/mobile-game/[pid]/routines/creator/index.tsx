import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { NextPageWithLayout } from 'pages/_app';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import RoutineCreator from 'src/components/routine/editor/RoutineCreator';
import AutomationLayout from '../../../../../../../../src/components/layouts/AutomationLayout';
import useGitIntegrationStore from '../../../../../../../../src/stores/git-integration';
import RoutineGitIntegrationAlert from '../../../../../../../../src/components/projects/RoutineGitIntegrationAlert';
import { isOrganizationScmIntegrated } from '../../../../../../../../src/utils/organization';
import TitleWithBannerAndOption from '../../../../../../../../src/components/layouts/TitleWithBannerAndOption';
import MobileGameTestAutomationFreeTierTopBanner from '../../../../../../../../src/components/billing/MobileGameTestAutomationFreeTierTopBanner';
import { MobileGameTestAutomationParallelCounter } from '../../../../../../../../src/components/projects/AutomationParallelCounter';

const ProjectRoutineCreatorPage: NextPageWithLayout<ProjectServerSideProps> = ({
  organization,
  project,
  isGitIntegrated,
}) => {
  const [isGitIntegratedState, updateGitIntegrationStatus] = useGitIntegrationStore(
    (state) => [state.isGitIntegrated, state.updateGitIntegrationStatus],
    shallow,
  );

  useEffect(() => {
    updateGitIntegrationStatus(isGitIntegrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGitIntegrated]);

  return (
    <>
      <Head>
        <title>Create routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        {!isGitIntegratedState && (
          <div style={{ marginBottom: '1rem' }}>
            <RoutineGitIntegrationAlert isScmIntegrated={isOrganizationScmIntegrated(organization)} />
          </div>
        )}
        <RoutineCreator project={project} />
      </Box>
    </>
  );
};

ProjectRoutineCreatorPage.getLayout = (page) => {
  return (
    <AutomationLayout
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
    </AutomationLayout>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default ProjectRoutineCreatorPage;

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
