import { PROJECT_TYPE } from '@dogu-private/types';
import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import ProjectListController from 'src/components/projects/ProjectListController';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import TableListView from '../../../../../src/components/common/TableListView';
import CreateProjectButton from '../../../../../src/components/projects/CreateProjectButton';
import RefreshButton from '../../../../../src/components/buttons/RefreshButton';
import LiveChat from '../../../../../src/components/external/livechat';
import TitleWithBannerAndOption from '../../../../../src/components/layouts/TitleWithBannerAndOption';
import MobileGameTestAutomationFreeTierTopBanner from '../../../../../src/components/billing/MobileGameTestAutomationFreeTierTopBanner';
import { MobileGameTestAutomationParallelCounter } from '../../../../../src/components/projects/AutomationParallelCounter';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../../../../src/styles/box';
import { DoguDocsUrl } from '../../../../../src/utils/url';
import TutorialButton from '../../../../../src/components/buttons/TutorialButton';

const GameAutomationPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  return (
    <>
      <Head>
        <title>Mobile Game Automation - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexBox>
            <FlexRow>
              <CreateProjectButton projectType={PROJECT_TYPE.GAME} />
              <TutorialButton href={DoguDocsUrl['get-started'].tutorials.game()} />
            </FlexRow>
            <RefreshButton />
          </FlexBox>
        }
        table={<ProjectListController organizationId={organization.organizationId} projectType={PROJECT_TYPE.GAME} />}
      />
      <LiveChat
        user={{
          name: user.name,
          email: user.email,
          organizationId: organization.organizationId,
        }}
      />
    </>
  );
};

GameAutomationPage.getLayout = (page) => {
  return (
    <ConsoleLayout
      {...page.props}
      sidebar={<OrganizationSideBar />}
      title={
        <TitleWithBannerAndOption
          titleKey="organization:mobileGameAutomationProjectPageTitle"
          banner={<MobileGameTestAutomationFreeTierTopBanner />}
          option={<MobileGameTestAutomationParallelCounter />}
        />
      }
    >
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default GameAutomationPage;

const FlexBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}

  & > * {
    margin-right: 0.5rem;
  }
`;
