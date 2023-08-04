import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import RefreshButton from '../../../../../src/components/buttons/RefreshButton';

import TableListView from '../../../../../src/components/common/TableListView';
import ProjectLayoutWithSidebar from '../../../../../src/components/layouts/ProjectLayoutWithSidebar';
import ProjectApplicationAPIButton from '../../../../../src/components/project-application/ProjectApplicationAPI';
import ProjectApplicationListController from '../../../../../src/components/project-application/ProjectApplicationListController';
import ProjectApplicationUploadButton from '../../../../../src/components/project-application/ProjectApplicationUploadButton';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from '../../../../../src/hoc/withProject';
import { flexRowSpaceBetweenStyle } from '../../../../../src/styles/box';
import { NextPageWithLayout } from '../../../../_app';

const ProjectAppPage: NextPageWithLayout<WithProjectProps> = ({ project, organization }) => {
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
              <ProjectApplicationAPIButton />
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
  return <ProjectLayoutWithSidebar titleI18nKey="project:tabMenuAppTitle">{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectAppPage);

const Header = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: row;
`;
