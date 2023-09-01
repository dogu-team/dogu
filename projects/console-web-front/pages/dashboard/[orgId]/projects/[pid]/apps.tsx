import { ApiOutlined } from '@ant-design/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Image from 'next/image';

import RefreshButton from '../../../../../src/components/buttons/RefreshButton';
import ExternalGuideLink from '../../../../../src/components/common/ExternalGuideLink';
import TableListView from '../../../../../src/components/common/TableListView';
import ProjectLayoutWithSidebar from '../../../../../src/components/layouts/ProjectLayoutWithSidebar';
import ProjectApplicationListController from '../../../../../src/components/project-application/ProjectApplicationListController';
import ProjectApplicationUploadButton from '../../../../../src/components/project-application/ProjectApplicationUploadButton';
import { getProjectPageServerSideProps, ProjectServerSideProps } from '../../../../../src/ssr/project';
import { flexRowSpaceBetweenStyle } from '../../../../../src/styles/box';
import { NextPageWithLayout } from '../../../../_app';

const ProjectAppPage: NextPageWithLayout<ProjectServerSideProps> = ({ project, organization }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Apps - {project.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <Header>
            <MenuList>
              <ProjectApplicationUploadButton organizationId={organization.organizationId} projectId={project.projectId} />

              <ExternalGuideLink
                href="https://docs.dogutech.io/integration/cicd/github-action"
                icon={<Image src="/resources/icons/github-action-logo.svg" alt="Github Action" width={16} height={16} />}
              >
                GitHub Action
              </ExternalGuideLink>
              <ExternalGuideLink
                href="https://docs.dogutech.io/integration/cicd/jenkins"
                icon={<Image src="/resources/icons/jenkins-logo.svg" alt="Jenkins" width={16} height={16} />}
              >
                Jenkins
              </ExternalGuideLink>

              <ExternalGuideLink href="https://docs.dogutech.io/api/project/application#upload-application" icon={<ApiOutlined style={{ fontSize: '1rem', color: '#000' }} />}>
                Upload API
              </ExternalGuideLink>
            </MenuList>
            <div>
              <RefreshButton />
            </div>
          </Header>
        }
        table={<ProjectApplicationListController organizationId={organization.organizationId} projectId={project.projectId} />}
      />
    </>
  );
};

ProjectAppPage.getLayout = (page) => {
  return (
    <ProjectLayoutWithSidebar {...page.props} titleI18nKey="project:tabMenuAppTitle">
      {page}
    </ProjectLayoutWithSidebar>
  );
};

export const getServerSideProps = getProjectPageServerSideProps;

export default ProjectAppPage;

const Header = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: row;
`;
