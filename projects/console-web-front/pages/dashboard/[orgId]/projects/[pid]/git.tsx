import ProjectLayout from '../../../../../src/components/layouts/ProjectLayout';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from '../../../../../src/hoc/withProject';
import { NextPageWithLayout } from '../../../../_app';

const ProjectGitPage: NextPageWithLayout<WithProjectProps> = ({}) => {
  return <div>Git config</div>;
};

ProjectGitPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectGitPage);
