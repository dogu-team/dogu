import useTranslation from 'next-translate/useTranslation';
import { useEffect, useRef } from 'react';
import Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { isAxiosError } from 'axios';
import { Button } from 'antd';
import { PROJECT_TYPE } from '@dogu-private/types';
import { ProjectBase } from '@dogu-private/console';
import { shallow } from 'zustand/shallow';
import styled from 'styled-components';

import { createRoutine } from '../../../api/routine';
import useRoutineEditorStore from '../../../stores/routine-editor';
import ErrorBox from '../../common/boxes/ErrorBox';
import RoutineEditor from '../../routine/editor/RoutineEditor';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessageFromAxios } from '../../../utils/error';
import { RoutineEditMode } from '../../../types/routine';
import YamlEditor from '../../editor/yaml/YamlEditor';
import RoutineGUIEditor from '../../routine/editor/RoutineGUIEditor';
import { ProjectContext } from '../../../hooks/context/useProjectContext';
import Link from 'next/link';
import { RiExternalLinkLine } from 'react-icons/ri';

interface Props {
  project: ProjectBase;
  sampleYaml: string;
}

const TutorialRoutineCreator = ({ project, sampleYaml }: Props) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const [yaml, updateYaml] = useRoutineEditorStore((state) => [state.yaml, state.updateYaml], shallow);
  const { t } = useTranslation();
  const isCustom = project?.type === PROJECT_TYPE.CUSTOM;

  useEffect(() => {
    updateYaml(sampleYaml);
  }, [sampleYaml]);

  function handleEditorOnChange() {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      updateYaml(value);
    }
  }

  async function handleSave() {
    const file = new File([yaml], 'index.yaml', { type: 'text/yaml' });

    try {
      const { routineId } = await createRoutine(project.organizationId, project.projectId, file);
      sendSuccessNotification(t('routine:createRoutineSuccessMessage'));
    } catch (error) {
      if (isAxiosError(error)) {
        sendErrorNotification(t('routine:createRoutineFailureMessage', { reason: getErrorMessageFromAxios(error) }));
        return;
      }
    }
  }

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Project not found." />;
  }

  return (
    <ProjectContext.Provider value={{ project, mutate: null }}>
      {isCustom && (
        <div style={{ marginBottom: '1rem' }}>
          <Link href="https://docs.dogutech.io/routine/routines/syntax" target="_blank">
            <Button>
              YAML Guide
              <RiExternalLinkLine style={{ marginLeft: '.25rem' }} />
            </Button>
          </Link>
        </div>
      )}
      <RoutineEditor
        mode={isCustom ? RoutineEditMode.SCRIPT : RoutineEditMode.GUI}
        menu={null}
        scriptEditor={isCustom ? <YamlEditor editorRef={editorRef} height={'65vh'} value={yaml} onChanged={handleEditorOnChange} /> : null}
        guiEditor={isCustom ? null : <RoutineGUIEditor projectType={project.type} hideAddButton />}
        preview={null}
      />

      <MenuBox>
        <Button type="primary" onClick={handleSave}>
          {t('tutorial:saveRoutineButtonTitle')}
        </Button>
      </MenuBox>
    </ProjectContext.Provider>
  );
};

export default TutorialRoutineCreator;

const MenuBox = styled.div``;
