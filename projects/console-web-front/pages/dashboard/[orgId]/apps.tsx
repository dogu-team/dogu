import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Image from 'next/image';

import { NextPageWithLayout } from '../../_app';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from '../../../src/ssr/organization';
import ConsoleLayout from '../../../src/components/layouts/ConsoleLayout';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../../src/styles/box';
import OrganizationSideBar from '../../../src/components/layouts/OrganizationSideBar';
import TableListView from '../../../src/components/common/TableListView';
import RefreshButton from '../../../src/components/buttons/RefreshButton';
import OrganizationApplicationListController from '../../../src/components/organization-application/OrganizationApplicationListController';
import OrganizationApplicationUploadButton from '../../../src/components/organization-application/OrganizationApplicationUploadButton';
import ExternalGuideLink from '../../../src/components/common/ExternalGuideLink';
import { ApiOutlined } from '@ant-design/icons';
import { DoguDocsUrl } from '../../../src/utils/url';

const OrganizationAppPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization, license }) => {
  return (
    <>
      <Head>
        <title>Apps - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexSpaceBetweenBox>
            <FlexRow>
              <OrganizationApplicationUploadButton organizationId={organization.organizationId} />

              <ExternalGuideLink
                href={DoguDocsUrl.integration.cicd['github-action']()}
                icon={
                  <Image src="/resources/icons/github-action-logo.svg" alt="Github Action" width={16} height={16} />
                }
              >
                GitHub Action
              </ExternalGuideLink>
              <ExternalGuideLink
                href={DoguDocsUrl.integration.cicd.jenkins()}
                icon={<Image src="/resources/icons/jenkins-logo.svg" alt="Jenkins" width={16} height={16} />}
              >
                Jenkins
              </ExternalGuideLink>

              <ExternalGuideLink
                href={DoguDocsUrl.api.organization.application['upload-application']()}
                icon={<ApiOutlined style={{ fontSize: '1rem', color: '#000' }} />}
              >
                API
              </ExternalGuideLink>
            </FlexRow>
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
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:appsStoragePageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<OrganizationServerSideProps> = getOrganizationPageServerSideProps;

export default OrganizationAppPage;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
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
