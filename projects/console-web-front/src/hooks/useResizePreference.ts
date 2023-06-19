import { useCallback, useRef } from 'react';

export type ResizerPreferenceKey = 'device-streaming-menu-width' | 'project-script-file-tree-width' | 'project-script-editor-width' | 'project-script-inspector-width';

const useResizePreference = (key: ResizerPreferenceKey, defaultWidth?: number) => {
  const initWidth = useRef<number>(localStorage.getItem(key) ? Number(localStorage.getItem(key)) : defaultWidth ?? 100);

  const saveWidth = useCallback(
    (width: number) => {
      localStorage.setItem(key, width.toString());
    },
    [key],
  );

  return { initWidth: initWidth.current, saveWidth };
};

export default useResizePreference;
