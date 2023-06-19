import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

const useDebouncedInputValues = (initValue?: string) => {
  const [inputValue, setInputValue] = useState(initValue);
  const [debouncedValue, setDebouncedValue] = useState('');

  const debouncedUpdateKeyword = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedValue(value);
      }, 250),
    [],
  );

  const handleChangeValues = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedUpdateKeyword(value);
    },
    [debouncedUpdateKeyword],
  );

  return { inputValue, debouncedValue, handleChangeValues };
};

export default useDebouncedInputValues;
