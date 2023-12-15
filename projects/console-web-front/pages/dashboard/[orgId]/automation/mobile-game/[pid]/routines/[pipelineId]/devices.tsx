import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import PipelineJobLayout from 'src/components/layouts/PipelineJobLayout';
import PipelineDeviceGrid from 'src/components/pipelines/PipelineDeviceGrid';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import useLivePipelineStore from 'src/stores/live-pipeline';
import MobileGameTestAutomationFreeTierTopBanner from '../../../../../../../../src/components/billing/MobileGameTestAutomationFreeTierTopBanner';
import TitleWithBannerAndOption from '../../../../../../../../src/components/layouts/TitleWithBannerAndOption';
import { MobileGameTestAutomationParallelCounter } from '../../../../../../../../src/components/projects/AutomationParallelCounter';
import { NextPageWithLayout } from '../../../../../../../_app';

const PipelineDeviceViewPage: NextPageWithLayout<ProjectServerSideProps> = ({ organization, project }) => {
  const router = useRouter();
  const liveJobs = useLivePipelineStore((state) => state.pipeline?.routineJobs);

  if (!liveJobs) {
    return <div>Loading...</div>;
  }

  return <PipelineDeviceGrid routineJobs={liveJobs} />;
};

PipelineDeviceViewPage.getLayout = (page) => {
  return (
    <PipelineJobLayout
      {...page.props}
      title={
        <TitleWithBannerAndOption
          titleKey="organization:mobileGameAutomationPageTitle"
          banner={<MobileGameTestAutomationFreeTierTopBanner />}
          option={<MobileGameTestAutomationParallelCounter />}
        />
      }
    >
      {page}
    </PipelineJobLayout>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default PipelineDeviceViewPage;
