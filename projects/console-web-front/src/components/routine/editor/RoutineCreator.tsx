import { ProjectBase } from '@dogu-private/console';
import { PROJECT_TYPE } from '@dogu-private/types';
import Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallow } from 'zustand/shallow';

import YamlEditor from '../../editor/yaml/YamlEditor';
import { createRoutine } from '../../../api/routine';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import useExitBlocker from '../../../hooks/useExitBlocker';
import RoutineEditor from './RoutineEditor';
import RoutineEditorMenu from './RoutineEditorMenu';
import useRoutineEditMode from '../../../hooks/useRoutineEditMode';
import { getErrorMessageFromAxios } from '../../../utils/error';
import useRoutineEditorStore from '../../../stores/routine-editor';
import RoutineGUIEditor from './RoutineGUIEditor';
import RoutineFlow from './RoutineFlow';

const APP_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  job-sample:
    runs-on:
      group: []
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          appVersion:
            android:
            ios:
        cwd:
`;

const WEB_ROUTINE_SAMPLE = `name: sample-routine

on:
  workflow_dispatch:

jobs:
  job-sample:
    runs-on:
      browserName:
      platformName:
    steps:
      - name: run test
        uses: dogu-actions/run-test
        with:
          checkout: true
          command:
        cwd:
`;

interface Props {
  project: ProjectBase;
}

const RoutineCreator = ({ project }: Props) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
  const router = useRouter();
  const [isChanged, setChanged] = useState<boolean>(false);
  const [mode, updateMode] = useRoutineEditMode(project);
  const [yaml, updateYaml] = useRoutineEditorStore((state) => [state.yaml, state.updateYaml], shallow);
  useExitBlocker(isChanged);
  const { t } = useTranslation();

  useEffect(() => {
    updateYaml(project.type === PROJECT_TYPE.WEB ? WEB_ROUTINE_SAMPLE : APP_ROUTINE_SAMPLE);
  }, [project.type]);

  function handleEditorOnChange() {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      updateYaml(value);
      if (value !== (project.type === PROJECT_TYPE.WEB ? WEB_ROUTINE_SAMPLE : APP_ROUTINE_SAMPLE)) {
        setChanged(true);
        return;
      }
    }

    setChanged(false);
  }

  async function handleSave() {
    const file = new File([yaml], 'index.yaml', { type: 'text/yaml' });
    setChanged(false);

    try {
      setChanged(false);
      const { routineId } = await createRoutine(project.organizationId, project.projectId, file);
      router.push(`/dashboard/${project.organizationId}/projects/${project.projectId}/routines?routine=${routineId}`);
      sendSuccessNotification(t('routine:createRoutineSuccessMessage'));
    } catch (error) {
      if (error instanceof AxiosError) {
        setChanged(true);
        sendErrorNotification(t('routine:createRoutineFailureMessage', { reason: getErrorMessageFromAxios(error) }));
        return;
      }
    }
  }

  return (
    <RoutineEditor
      mode={mode}
      menu={<RoutineEditorMenu projectType={project.type} mode={mode} saveButtonText={t('routine:createRoutineButtonTitle')} onSave={handleSave} onChangeMode={updateMode} />}
      scriptEditor={<YamlEditor editorRef={editorRef} height={'65vh'} value={yaml} onChanged={handleEditorOnChange} />}
      guiEditor={<RoutineGUIEditor />}
      preview={<RoutineFlow />}
    />
  );
};

export default RoutineCreator;
