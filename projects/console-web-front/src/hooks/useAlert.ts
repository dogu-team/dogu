import { useCallback, useState } from 'react';

interface AlertContent {
  isOpen: boolean;
  message: string;
  isSucceed: Boolean;
}

/**
 * Custom hook for action result. ex) Form
 * @returns [alertContent, openAlert, closeAlert]
 */
const useResultAlert = (): [AlertContent, (isSucceed: boolean, message: string) => void, () => void] => {
  const [result, setResult] = useState<AlertContent>({
    isOpen: false,
    message: '',
    isSucceed: false,
  });

  const openAlert = useCallback(
    (isSucceed: boolean, message: string) => setResult({ isOpen: true, message, isSucceed }),
    [],
  );

  const closeAlert = useCallback(() => setResult({ isOpen: false, message: '', isSucceed: false }), []);

  return [result, openAlert, closeAlert];
};

export default useResultAlert;
