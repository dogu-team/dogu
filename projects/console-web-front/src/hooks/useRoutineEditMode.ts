import { useCallback, useState } from 'react';

import { RoutineEditMode } from '../types/routine';

const useRoutineEditMode = () => {
  const [mode, setMode] = useState<RoutineEditMode>(() => {
    return (sessionStorage.getItem('routineEditMode') as RoutineEditMode | undefined) ?? RoutineEditMode.GUI;
  });

  const changeMode = useCallback((mode: RoutineEditMode) => {
    setMode(mode);

    if (mode !== RoutineEditMode.PREVIEW) {
      sessionStorage.setItem('routineEditMode', mode);
    }
  }, []);

  return [mode, changeMode] as const;
};

export default useRoutineEditMode;
