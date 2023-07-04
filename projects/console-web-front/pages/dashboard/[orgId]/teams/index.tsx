import Head from 'next/head';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TableListView from 'src/components/common/TableListView';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import TeamListController from 'src/components/teams/TeamListController';
import CreateTeamButton from 'src/components/teams/CreateTeamButton';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import TeamFilter from 'src/components/teams/TeamFilter';

const TeamPage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>Teams - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopBox>
            <TopLeft>
              <CreateTeamButton />
              <TeamFilter />
            </TopLeft>
            <RefreshButton />
          </TopBox>
        }
        table={<TeamListController />}
      />
    </>
  );
};

TeamPage.getLayout = (page) => {
  return (
    <ConsoleLayout sidebar={<OrganizationSideBar />} titleI18nKey="organization:teamPageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(TeamPage);

const TopBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
`;
