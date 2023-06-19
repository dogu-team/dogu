import { RoutinePipelineId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import PipelineJobLayout from 'src/components/layouts/PipelineJobLayout';
import JobFlowController from 'src/components/pipelines/JobFlowController';
import Head from 'next/head';

const PipelineDetailPage: NextPageWithLayout<WithProjectProps> = ({ organization, project }) => {
  const router = useRouter();
  const pipelineId = router.query.pipelineId;

  if (!pipelineId) {
    return (
      <div>
        <ErrorBox title="Error!" desc="Invalid link" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pipeline - {project.name} | Dogu</title>
      </Head>
      <div>
        <JobFlowController orgId={organization.organizationId} projectId={project.projectId} pipelineId={Number(pipelineId) as RoutinePipelineId} />
      </div>
    </>
  );
};

PipelineDetailPage.getLayout = (page) => {
  return <PipelineJobLayout isWebview={page.props.isWebview}>{page}</PipelineJobLayout>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default withProject(PipelineDetailPage);
