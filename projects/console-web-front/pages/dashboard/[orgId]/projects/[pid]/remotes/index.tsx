import Head from 'next/head';
import styled from 'styled-components';

import RefreshButton from '../../../../../../src/components/buttons/RefreshButton';
import TableListView from '../../../../../../src/components/common/TableListView';
import ProjectLayoutWithSidebar from '../../../../../../src/components/layouts/ProjectLayoutWithSidebar';
import RemoteItem from '../../../../../../src/components/remote/RemoteItem';
import RemoteListController from '../../../../../../src/components/remote/RemoteListController';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from '../../../../../../src/hoc/withProject';
import { flexRowSpaceBetweenStyle } from '../../../../../../src/styles/box';
import { NextPageWithLayout } from '../../../../../_app';

const RemoteListPage: NextPageWithLayout<WithProjectProps> = ({ organization, project }) => {
  return (
    <>
      <Head>
        <title>Project remotes - {project.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexBetweenBox>
            <div />
            <RefreshButton />
          </FlexBetweenBox>
        }
        table={
          <RemoteListController
            organizationId={organization.organizationId}
            projectId={project.projectId}
            renderItem={(item) => <RemoteItem remote={item} organizationId={organization.organizationId} />}
          />
        }
      />
    </>
  );
};

RemoteListPage.getLayout = (page) => {
  return <ProjectLayoutWithSidebar titleI18nKey="project:tabMenuRemoteTitle">{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(RemoteListPage);

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
