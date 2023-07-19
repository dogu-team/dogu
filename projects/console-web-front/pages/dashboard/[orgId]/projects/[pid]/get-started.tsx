import ProjectLayout from '../../../../../src/components/layouts/ProjectLayout';
import { getProjectPageServerSideProps, WithProjectProps } from '../../../../../src/hoc/withProject';
import useAuth from '../../../../../src/hooks/useAuth';
import { TutorialContext } from '../../../../../src/hooks/useTutorialContext';
import { NextPageWithLayout } from '../../../../_app';

const ProjectGetStartedPage: NextPageWithLayout<WithProjectProps> = ({ project, organization }) => {
  const { me } = useAuth();

  return <TutorialContext.Provider value={{ me, organization, project }}></TutorialContext.Provider>;
};

ProjectGetStartedPage.getLayout = (page) => {
  return <ProjectLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default ProjectGetStartedPage;
