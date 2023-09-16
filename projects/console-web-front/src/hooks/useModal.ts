import { useCallback, useState } from 'react';

const useModal = <T = undefined>(
  initState: boolean = false,
): [boolean, (payload?: T) => void, () => void, T | undefined] => {
  const [isOpen, setIsOpen] = useState(initState);
  const [data, setData] = useState<T>();

  const openModal = useCallback((payload?: T) => {
    setIsOpen(true);
    setData(payload);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  return [isOpen, openModal, closeModal, data];
};

export default useModal;
