import { UploadSampleAppDtoBase } from '@dogu-private/console';
import { Alert } from 'antd';
import useTranslation from 'next-translate/useTranslation';

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
  const { t } = useTranslation('tutorial');

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Project not found" />;
  }

  if (hasSampleApp) {
    return <SampleApplicationUploadButton organizationId={project.organizationId} projectId={project.projectId} category={category} />;
  }

  return (
    <Alert
      style={{ marginTop: '.5rem' }}
      message={t('uploadSampleAppNotSupportMessage')}
      type="warning"
      showIcon
      action={<ProjectApplicationUploadButton organizationId={project.organizationId} projectId={project.projectId} />}
    />
  );
};

export default SampleApplicationUploadStep;
