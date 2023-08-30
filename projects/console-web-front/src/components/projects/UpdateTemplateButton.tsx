import { ProjectBase } from '@dogu-private/console';
import { PROJECT_TYPE } from '@dogu-private/types';
import { isAxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { updateProject } from '../../api/project';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import DangerZone from '../common/boxes/DangerZone';
import ProjectTypeRadio from './ProjectTypeRadio';

interface Props {
  project: ProjectBase;
}

const UpdateTemplateButton = ({ project }: Props) => {
  const [projectType, setProjectType] = useState<PROJECT_TYPE>(project.type);
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);
  const { t } = useTranslation('project');

  useEffect(() => {
    setProjectType(project.type);
  }, [project.type]);

  const handleConfirm = async () => {
    try {
      updateProject(project.organizationId, project.projectId, { name: project.name, type: projectType, description: project.description });
      sendSuccessNotification('Project template updated.');
      fireEvent('onProjectUpdated');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to update project template.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <DangerZone.Button
      modalTitle={t('changeProjectTemplateConfirmModalTitle')}
      modalContent={
        <div>
          <p style={{ marginBottom: '1rem' }}>
            <Trans i18nKey="project:settingChangeProjectTemplateConfirmContent" components={{ br: <br /> }} />
          </p>
          <ProjectTypeRadio value={projectType} onChange={(e) => setProjectType(e.target.value)} />
        </div>
      }
      onConfirm={handleConfirm}
      access-id="update-project-template-btn"
      modalButtonTitle={t('changeProjectTemplateConfirmModalButtonText')}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setProjectType(project.type);
        }
      }}
    >
      {t('changeProjectTemplateButtonText')}
    </DangerZone.Button>
  );
};

export default UpdateTemplateButton;
