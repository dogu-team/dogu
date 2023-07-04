import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import ProjectListController from 'src/components/projects/ProjectListController';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import TableListView from '../../../../src/components/common/TableListView';
import CreateProjectButton from '../../../../src/components/projects/CreateProjectButton';
import RefreshButton from '../../../../src/components/buttons/RefreshButton';
import { flexRowSpaceBetweenStyle } from '../../../../src/styles/box';

const TeamProjectsPage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>Projects - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexBox>
            <CreateProjectButton />
            <RefreshButton />
          </FlexBox>
        }
        table={<ProjectListController organizationId={organization.organizationId} />}
      />
    </>
  );
};

TeamProjectsPage.getLayout = (page) => {
  return (
    <ConsoleLayout sidebar={<OrganizationSideBar />} titleI18nKey="organization:projectPageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(TeamProjectsPage);

const FlexBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
