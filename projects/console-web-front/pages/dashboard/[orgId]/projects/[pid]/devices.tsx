import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TableListView from 'src/components/common/TableListView';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import DeviceListController from 'src/components/projects/DeviceListController';
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
                <Button type="primary">{t('device:allocProjectToDeviceButtonText')}</Button>
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
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectDevicePage);

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
