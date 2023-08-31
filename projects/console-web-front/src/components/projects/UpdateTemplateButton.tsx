import { ProjectBase } from '@dogu-private/console';
import { PROJECT_TYPE } from '@dogu-private/types';
import { isAxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { updateProject } from '../../api/project';
import useProjectContext from '../../hooks/useProjectContext';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import DangerZone from '../common/boxes/DangerZone';
import ProjectTypeRadio from './ProjectTypeRadio';

interface Props {}

const UpdateTemplateButton = ({}: Props) => {
  const { project, mutate } = useProjectContext();
  const [projectType, setProjectType] = useState<PROJECT_TYPE>(project?.type || PROJECT_TYPE.CUSTOM);
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);
  const { t } = useTranslation('project');

  useEffect(() => {
    if (project?.type !== undefined) {
      setProjectType(project.type);
    }
  }, [project?.type]);

  const handleConfirm = async () => {
    if (!project) {
      return;
    }

    try {
      const rv = await updateProject(project.organizationId, project.projectId, { type: projectType });
      mutate?.(rv, false);
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
          setProjectType(project?.type || PROJECT_TYPE.CUSTOM);
        }
      }}
    >
      {t('changeProjectTemplateButtonText')}
    </DangerZone.Button>
  );
};

export default UpdateTemplateButton;
