import Head from 'next/head';
import styled from 'styled-components';

import RefreshButton from '../../../../../../src/components/buttons/RefreshButton';
import TableListView from '../../../../../../src/components/common/TableListView';
import ProjectLayout from '../../../../../../src/components/layouts/ProjectLayout';
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
            <div></div>
            <RefreshButton />
          </FlexBetweenBox>
        }
        table={<RemoteListController organizationId={organization.organizationId} projectId={project.projectId} />}
      />
    </>
  );
};

RemoteListPage.getLayout = (page) => {
  return <ProjectLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(RemoteListPage);

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
