import { ArrowRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
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
            <div>
              <Link href={`/dashboard/${organization.organizationId}/projects/${project.projectId}/get-started`}>
                <StyledButton>
                  Tutorial <ArrowRightOutlined />
                </StyledButton>
              </Link>
            </div>
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

const StyledButton = styled(Button)`
  padding: 4px 8px;

  &:hover .anticon {
    transition: transform 0.2s;
    transform: translateX(0.25rem);
  }

  &:active {
    color: ${(props) => props.theme.colorPrimary} !important;
  }
`;
