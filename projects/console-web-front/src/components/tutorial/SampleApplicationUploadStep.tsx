import { UploadSampleAppDtoBase } from '@dogu-private/console';
import { Alert } from 'antd';

import useTutorialContext from '../../hooks/context/useTutorialContext';
import ErrorBox from '../common/boxes/ErrorBox';
import ProjectApplicationUploadButton from '../project-application/ProjectApplicationUploadButton';
import SampleApplicationUploadButton from './SampleApplicationUploadButton';

interface Props {
  hasSampleApp?: boolean;
  category: UploadSampleAppDtoBase['category'];
}

const SampleApplicationUploadStep = ({ hasSampleApp, category }: Props) => {
  const { project } = useTutorialContext();

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Project not found" />;
  }

  if (hasSampleApp) {
    return <SampleApplicationUploadButton organizationId={project.organizationId} projectId={project.projectId} category={category} />;
  }

  return (
    <Alert
      style={{ marginTop: '.5rem' }}
      message="For this platform, we don't provide sample app. Please upload your app manually."
      type="warning"
      showIcon
      action={<ProjectApplicationUploadButton organizationId={project.organizationId} projectId={project.projectId} />}
    />
  );
};

export default SampleApplicationUploadStep;
