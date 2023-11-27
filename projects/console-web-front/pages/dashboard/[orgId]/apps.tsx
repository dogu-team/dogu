import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

import { NextPageWithLayout } from '../../_app';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from '../../../src/ssr/organization';
import ConsoleLayout from '../../../src/components/layouts/ConsoleLayout';
import { flexRowSpaceBetweenStyle } from '../../../src/styles/box';
import OrganizationSideBar from '../../../src/components/layouts/OrganizationSideBar';
import TableListView from '../../../src/components/common/TableListView';
import RefreshButton from '../../../src/components/buttons/RefreshButton';
import OrganizationApplicationListController from '../../../src/components/organization-application/OrganizationApplicationListController';
import OrganizationApplicationUploadButton from '../../../src/components/organization-application/OrganizationApplicationUploadButton';

const OrganizationAppPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization, license }) => {
  return (
    <>
      <Head>
        <title>Apps - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexSpaceBetweenBox>
            <div>
              <OrganizationApplicationUploadButton organizationId={organization.organizationId} />
            </div>
            <div>
              <RefreshButton />
            </div>
          </FlexSpaceBetweenBox>
        }
        table={<OrganizationApplicationListController organizationId={organization.organizationId} />}
      />
    </>
  );
};

OrganizationAppPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:appsPageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<OrganizationServerSideProps> = getOrganizationPageServerSideProps;

export default OrganizationAppPage;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const DescriptionWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  line-height: 1.5;
  color: #666;
`;
