import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TableListView from 'src/components/common/TableListView';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import RunnerListController from 'src/components/projects/RunnerListController';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import { flexRowSpaceBetweenStyle } from '../../../../../src/styles/box';
import Head from 'next/head';

const ProjectDevicePage: NextPageWithLayout<WithProjectProps> = ({ project, organization }) => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Project devices - {project.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <FlexBetweenBox>
            <div>
              <Link href={`/dashboard/${organization.organizationId}/devices`}>
                <Button type="primary">{t('runner:allocProjectToRunnerButtonText')}</Button>
              </Link>
            </div>
            <RefreshButton />
          </FlexBetweenBox>
        }
        table={<RunnerListController projectId={project.projectId} organizationId={project.organizationId} />}
      />
    </>
  );
};

ProjectDevicePage.getLayout = (page) => {
  return <ProjectLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectDevicePage);

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
