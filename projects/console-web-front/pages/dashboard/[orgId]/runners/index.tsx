import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import TableListView from 'src/components/common/TableListView';
import RunnerListController from 'src/components/runner/RunnerListController';
import RunnerFilter from 'src/components/runner/RunnerFilter';
import RefreshButton from 'src/components/buttons/RefreshButton';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import OrganizationRunnerLayout from 'src/components/layouts/OrganizationRunnerLayout';

const TeamDevicePage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>In-use devices - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopWrapper>
            <RunnerFilter />
            <RefreshButton />
          </TopWrapper>
        }
        table={<RunnerListController />}
      />
    </>
  );
};

TeamDevicePage.getLayout = (page) => {
  return <OrganizationRunnerLayout>{page}</OrganizationRunnerLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(TeamDevicePage);

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
