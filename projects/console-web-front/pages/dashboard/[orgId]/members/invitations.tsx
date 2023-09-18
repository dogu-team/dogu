import Head from 'next/head';
import styled from 'styled-components';

import RefreshButton from '../../../../src/components/buttons/RefreshButton';
import TableListView from '../../../../src/components/common/TableListView';
import OrganizationMemberLayout from '../../../../src/components/layouts/OrganizationMemberLayout';
import InviteUserButton from '../../../../src/components/users/InviteUserButton';
import OrganizationInvitationMemberListController from '../../../../src/components/users/OrganizationInvitationMemberListController';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from '../../../../src/ssr/organization';
import { NextPageWithLayout } from '../../../_app';

const InvitationUserPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>Member invitations - {organization.name} | Dogu</title>
      </Head>

      <TableListView
        top={
          <InviteButtonBox>
            <TopLeftWrapper>
              <InviteUserButton />
            </TopLeftWrapper>
            <div>
              <RefreshButton />
            </div>
          </InviteButtonBox>
        }
        table={<OrganizationInvitationMemberListController organizationId={organization.organizationId} />}
      />
    </>
  );
};

InvitationUserPage.getLayout = (page) => {
  return (
    <OrganizationMemberLayout {...page.props} titleI18nKey="organization:memberPageTitle">
      {page}
    </OrganizationMemberLayout>
  );
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default InvitationUserPage;

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
