import { RemoteBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { getRemoteInServerSide } from '../../../../../../src/api/remote';
import ProjectLayout from '../../../../../../src/components/layouts/ProjectLayout';
import RemoteDestListController from '../../../../../../src/components/remote/RemoteDestList';
import RemoteSidebar from '../../../../../../src/components/remote/RemoteSidebar';
import withProject, { getProjectPageServerSideProps, ProjectServerSideProps, WithProjectProps } from '../../../../../../src/hoc/withProject';
import { flexRowSpaceBetweenStyle } from '../../../../../../src/styles/box';
import { NextPageWithLayout } from '../../../../../_app';

const RemoteItemPage: NextPageWithLayout<WithProjectProps & { remote: RemoteBase }> = ({ organization, project, remote }) => {
  const router = useRouter();
  const selectedJob = remote.remoteDeviceJobs?.find((rdj) => rdj.remoteDeviceJobId === (router.query.jobId as string | undefined)) ?? remote.remoteDeviceJobs?.[0];

  return (
    <>
      <Head>
        <title>
          Remote report {remote.remoteId} - {project.name} | Dogu
        </title>
      </Head>
      <div>
        <div></div>
        <div>
          {!!selectedJob && (
            <RemoteDestListController organizationId={organization.organizationId} projectId={project.projectId} remoteDeviceJobId={selectedJob?.remoteDeviceJobId} />
          )}
        </div>
      </div>
    </>
  );
};

RemoteItemPage.getLayout = (page) => {
  return <ProjectLayout sidebar={<RemoteSidebar remote={page.props.remote} />}>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps<ProjectServerSideProps & { remote: RemoteBase }> = async (context) => {
  const result = await getProjectPageServerSideProps(context);

  if ('props' in result) {
    try {
      const remoteBase = await getRemoteInServerSide(context);

      return {
        props: {
          ...(result.props as ProjectServerSideProps),
          remote: remoteBase,
        },
      };
    } catch (e) {
      return {
        notFound: true,
      };
    }
  } else {
    return result;
  }
};

export default withProject(RemoteItemPage);

const FlexBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
