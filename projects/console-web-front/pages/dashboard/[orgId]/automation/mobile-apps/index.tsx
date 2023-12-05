import styled from 'styled-components';
import Head from 'next/head';
import { PROJECT_TYPE } from '@dogu-private/types';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import ProjectListController from 'src/components/projects/ProjectListController';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import TableListView from '../../../../../src/components/common/TableListView';
import CreateProjectButton from '../../../../../src/components/projects/CreateProjectButton';
import RefreshButton from '../../../../../src/components/buttons/RefreshButton';
import LiveChat from '../../../../../src/components/external/livechat';
import { flexRowSpaceBetweenStyle } from '../../../../../src/styles/box';

const AppAutomationPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  return (
    <>
      <Head>
        <title>App Automation - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexBox>
            <CreateProjectButton projectType={PROJECT_TYPE.APP} />
            <RefreshButton />
          </FlexBox>
        }
        table={<ProjectListController organizationId={organization.organizationId} projectType={PROJECT_TYPE.APP} />}
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

AppAutomationPage.getLayout = (page) => {
  return (
    <ConsoleLayout
      {...page.props}
      sidebar={<OrganizationSideBar />}
      titleI18nKey="organization:mobileAppAutomationPageTitle"
    >
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default AppAutomationPage;

const FlexBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
