import { useRouter } from 'next/router';
import { TeamId } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import useSWR from 'swr';
import { useCallback } from 'react';
import { TeamBase } from '@dogu-private/console';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import TeamSettings from 'src/components/teams/TeamSettings';
import { swrAuthFetcher } from 'src/api';
import TeamPageLayout from 'src/components/layouts/TeamPageLayout';

const TeamMemberPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const teamId = Number(router.query.teamId) as TeamId;
  const { data, error, isLoading, mutate } = useSWR<TeamBase>(
    `/organizations/${orgId}/teams/${teamId}`,
    swrAuthFetcher,
  );

  const handleAfterUpdate = useCallback(
    async (result: TeamBase) => {
      mutate((prev) => {
        if (prev) {
          return {
            ...prev,
            ...result,
          };
        }
      });
    },
    [mutate],
  );

  const handleAfterRemove = useCallback(
    () => router.push(`/dashboard/${organization.organizationId}/teams`),
    [organization.organizationId, router],
  );

  if (isLoading) {
    return null;
  }

  if (!data || error) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Team settings | Dogu</title>
      </Head>
      <TeamSettings
        organizationId={organization.organizationId}
        team={data}
        onUpdateEnd={handleAfterUpdate}
        onDeleteEnd={handleAfterRemove}
      />
    </>
  );
};

TeamMemberPage.getLayout = (page) => {
  return <TeamPageLayout organization={page.props.organization}>{page}</TeamPageLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default TeamMemberPage;
