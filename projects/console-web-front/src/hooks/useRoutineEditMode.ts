import { ProjectBase } from '@dogu-private/console';
import { PROJECT_TYPE } from '@dogu-private/types';
import { useCallback, useState } from 'react';

import { RoutineEditMode } from '../types/routine';

const useRoutineEditMode = (project: ProjectBase) => {
  const [mode, setMode] = useState<RoutineEditMode>(() =>
    project.type === PROJECT_TYPE.CUSTOM ? RoutineEditMode.SCRIPT : RoutineEditMode.GUI,
  );

  const changeMode = useCallback((mode: RoutineEditMode) => {
    setMode(mode);
  }, []);

  return [mode, changeMode] as const;
};

export default useRoutineEditMode;
