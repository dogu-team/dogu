import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import PipelineJobLayout from 'src/components/layouts/PipelineJobLayout';
import PipelineDeviceGrid from 'src/components/pipelines/PipelineDeviceGrid';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import useLivePipelineStore from 'src/stores/live-pipeline';
import MobileAppTestAutomationFreeTierTopBanner from '../../../../../../../../src/components/billing/MobileAppTestAutomationFreeTierTopBanner';
import TitleWithBannerAndOption from '../../../../../../../../src/components/layouts/TitleWithBannerAndOption';
import { MobileAppTestAutomationParallelCounter } from '../../../../../../../../src/components/projects/AutomationParallelCounter';
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
          titleKey="organization:mobileAppAutomationPageTitle"
          banner={<MobileAppTestAutomationFreeTierTopBanner />}
          option={<MobileAppTestAutomationParallelCounter />}
        />
      }
    >
      {page}
    </PipelineJobLayout>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default PipelineDeviceViewPage;
