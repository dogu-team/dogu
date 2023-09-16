import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { TeamId } from '@dogu-private/types';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import TableListView from 'src/components/common/TableListView';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import RefreshButton from 'src/components/buttons/RefreshButton';
import AddProjectButton from 'src/components/teams/AddProjectButton';
import TeamProjectFilter from 'src/components/teams/TeamProjectFilter';
import ProjectListController from 'src/components/teams/ProjectListController';
import TeamPageLayout from 'src/components/layouts/TeamPageLayout';

const TeamProjectPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const teamId = Number(router.query.teamId) as TeamId;

  return (
    <>
      <Head>
        <title>Team projects | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopBox>
            <TopBoxInnerLeft>
              <AddProjectButton organizationId={organization.organizationId} teamId={teamId} />
              <TeamProjectFilter />
            </TopBoxInnerLeft>
            <RefreshButton />
          </TopBox>
        }
        table={<ProjectListController organizationId={organization.organizationId} teamId={teamId} />}
      />
    </>
  );
};

TeamProjectPage.getLayout = (page) => {
  return <TeamPageLayout {...page.props}>{page}</TeamPageLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default TeamProjectPage;

const TopBox = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const TopBoxInnerLeft = styled.div`
  display: flex;
  align-items: flex-end;

  & > button {
    margin-right: 0.5rem;
  }
`;
