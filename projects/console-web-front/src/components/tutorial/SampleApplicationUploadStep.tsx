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
  extension: UploadSampleAppDtoBase['extension'];
}

const SampleApplicationUploadStep = ({ hasSampleApp, category, extension }: Props) => {
  const { project } = useTutorialContext();
  const { t } = useTranslation('tutorial');

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Project not found" />;
  }

  if (hasSampleApp) {
    return (
      <>
        <SampleApplicationUploadButton
          organizationId={project.organizationId}
          category={category}
          extension={extension}
        />
        {extension === 'ipa' && (
          <Alert
            style={{ marginTop: '.5rem' }}
            message={
              'iOS의 Self device에서는 제공하는 샘플 앱을 설치할 수 없습니다. Self device에서 실행하기 위해서는 직접 앱을 업로드하세요.'
            }
            type="warning"
            showIcon
            action={
              <ProjectApplicationUploadButton organizationId={project.organizationId} projectId={project.projectId} />
            }
          />
        )}
      </>
    );
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
