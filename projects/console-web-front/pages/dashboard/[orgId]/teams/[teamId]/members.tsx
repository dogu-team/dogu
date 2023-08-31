import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { TeamId } from '@dogu-private/types';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import TableListView from 'src/components/common/TableListView';
import MemberListController from 'src/components/teams/MemberListController';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/hoc/withOrganization';
import AddMemberButton from 'src/components/teams/AddMemberButton';
import TeamMemberFilter from 'src/components/teams/TeamMemberFilter';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TeamPageLayout from 'src/components/layouts/TeamPageLayout';

const TeamMemberPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const teamId = Number(router.query.teamId) as TeamId;

  return (
    <>
      <Head>
        <title>Team member | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopBox>
            <TopBoxInnerLeft>
              <AddMemberButton organizationId={organization.organizationId} teamId={teamId} type="primary">
                {t('team:addMemberButtonTitle')}
              </AddMemberButton>
              <TeamMemberFilter />
            </TopBoxInnerLeft>
            <RefreshButton />
          </TopBox>
        }
        table={<MemberListController organizationId={organization.organizationId} teamId={teamId} />}
      />
    </>
  );
};

TeamMemberPage.getLayout = (page) => {
  return <TeamPageLayout organization={page.props.organization}>{page}</TeamPageLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default TeamMemberPage;

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
