import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import InviteUserButton from 'src/components/users/InviteUserButton';
import TableListView from 'src/components/common/TableListView';
import OrganizationMemberListController from 'src/components/users/OrganizationMemberListController';
import RefreshButton from 'src/components/buttons/RefreshButton';
import OrganizationMemberFilter from 'src/components/users/OrganizationMemberFilter';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import OrganizationMemberLayout from '../../../../src/components/layouts/OrganizationMemberLayout';

const ManageUserPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>Members - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <InviteButtonBox>
            <TopLeftWrapper>
              <InviteUserButton />
              <OrganizationMemberFilter />
            </TopLeftWrapper>
            <div>
              <RefreshButton />
            </div>
          </InviteButtonBox>
        }
        table={<OrganizationMemberListController />}
      />
    </>
  );
};

ManageUserPage.getLayout = (page) => {
  return (
    <OrganizationMemberLayout {...page.props} titleI18nKey="organization:memberPageTitle">
      {page}
    </OrganizationMemberLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default ManageUserPage;

const TopLeftWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * {
    margin-right: 0.5rem;
  }

  @media only screen and (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;

    & > * {
      margin-right: 0;
    }
  }
`;

const InviteButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;
