import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TableListView from 'src/components/common/TableListView';
import DeviceListController from 'src/components/projects/DeviceListController';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/hoc/withProject';
import { flexRowSpaceBetweenStyle } from '../../../../../src/styles/box';
import Head from 'next/head';
import ProjectLayoutWithSidebar from '../../../../../src/components/layouts/ProjectLayoutWithSidebar';

const ProjectDevicePage: NextPageWithLayout<ProjectServerSideProps> = ({ project, organization }) => {
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
              <Link href={`/dashboard/${organization.organizationId}/device-farm/devices`}>
                <Button type="primary">{t('device-farm:allocProjectToDeviceButtonText')}</Button>
              </Link>
            </div>
            <RefreshButton />
          </FlexBetweenBox>
        }
        table={<DeviceListController projectId={project.projectId} organizationId={project.organizationId} />}
      />
    </>
  );
};

ProjectDevicePage.getLayout = (page) => {
  return (
    <ProjectLayoutWithSidebar {...page.props} titleI18nKey="project:tabMenuDeviceTitle">
      {page}
    </ProjectLayoutWithSidebar>
  );
};

export const getServerSideProps = getProjectPageServerSideProps;

export default ProjectDevicePage;

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
