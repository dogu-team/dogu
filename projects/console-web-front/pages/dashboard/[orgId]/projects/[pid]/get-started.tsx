import ProjectLayout from '../../../../../src/components/layouts/ProjectLayout';
import UsageGuide from '../../../../../src/components/projects/guides/UsageGuide';
import { getProjectPageServerSideProps, WithProjectProps } from '../../../../../src/hoc/withProject';
import { NextPageWithLayout } from '../../../../_app';

const ProjectGetStartedPage: NextPageWithLayout<WithProjectProps> = ({}) => {
  return (
    <div>
      <UsageGuide />
    </div>
  );
};

ProjectGetStartedPage.getLayout = (page) => {
  return <ProjectLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default ProjectGetStartedPage;
