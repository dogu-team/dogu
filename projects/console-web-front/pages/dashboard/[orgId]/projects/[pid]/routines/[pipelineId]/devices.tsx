import { JobDisplayQuery, RoutineJobBase } from '@dogu-private/console';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../../../../../src/api';
import PipelineJobLayout from '../../../../../../../src/components/layouts/PipelineJobLayout';
import PipelineDeviceGrid from '../../../../../../../src/components/pipelines/PipelineDeviceGrid';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from '../../../../../../../src/hoc/withProject';
import useLivePipelineStore from '../../../../../../../src/stores/live-pipeline';
import { NextPageWithLayout } from '../../../../../../_app';

const PipelineDeviceViewPage: NextPageWithLayout<WithProjectProps> = ({ organization, project }) => {
  const router = useRouter();
  const liveJobs = useLivePipelineStore((state) => state.pipeline?.routineJobs);

  if (!liveJobs) {
    return <div>Loading...</div>;
  }

  return <PipelineDeviceGrid routineJobs={liveJobs} />;
};

PipelineDeviceViewPage.getLayout = (page) => {
  return <PipelineJobLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</PipelineJobLayout>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default withProject(PipelineDeviceViewPage);
