import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import LatestProjectsBoard from '../../../src/components/dashboards/LatestProjectsBoard';
import { OrganizationLatestTestsBoard } from '../../../src/components/dashboards/LatestTestsBoard';
import ParallelUsageBoard from '../../../src/components/dashboards/ParallelUsageBoard';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from '../../../src/ssr/organization';
import { flexRowBaseStyle } from '../../../src/styles/box';

const OrganizationPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  return (
    <div>
      <FlexRow>
        <ParallelUsageBoard />
        <OrganizationLatestTestsBoard organizationId={organization.organizationId} />
        <LatestProjectsBoard organizationId={organization.organizationId} />
      </FlexRow>
    </div>
  );
};

OrganizationPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />}>
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default OrganizationPage;

const FlexRow = styled.div`
  ${flexRowBaseStyle}

  & > *:not(:last-child) {
    margin-right: 1.5rem;
  }
`;
