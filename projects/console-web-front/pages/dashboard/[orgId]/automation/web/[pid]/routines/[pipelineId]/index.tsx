import { RoutinePipelineId } from '@dogu-private/types';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import ErrorBox from 'src/components/common/boxes/ErrorBox';
import PipelineJobLayout from 'src/components/layouts/PipelineJobLayout';
import JobFlowController from 'src/components/pipelines/JobFlowController';
import TitleWithBannerAndOption from '../../../../../../../../src/components/layouts/TitleWithBannerAndOption';
import WebTestAutomationFreeTierTopBanner from '../../../../../../../../src/components/billing/WebTestAutomationFreeTierTopBanner';
import { WebTestAutomationParallelCounter } from '../../../../../../../../src/components/projects/AutomationParallelCounter';

const PipelineDetailPage: NextPageWithLayout<ProjectServerSideProps> = ({ organization, project }) => {
  const router = useRouter();
  const pipelineId = router.query.pipelineId;

  if (!pipelineId) {
    return (
      <div>
        <ErrorBox title="Not Found" desc="Invalid pipeline ID" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pipeline - {project.name} | Dogu</title>
      </Head>
      <div>
        <JobFlowController
          orgId={organization.organizationId}
          projectId={project.projectId}
          pipelineId={Number(pipelineId) as RoutinePipelineId}
        />
      </div>
    </>
  );
};

PipelineDetailPage.getLayout = (page) => {
  return (
    <PipelineJobLayout
      {...page.props}
      title={
        <TitleWithBannerAndOption
          titleKey="organization:webAutomationPageTitle"
          banner={<WebTestAutomationFreeTierTopBanner />}
          option={<WebTestAutomationParallelCounter />}
        />
      }
    >
      {page}
    </PipelineJobLayout>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default PipelineDetailPage;
