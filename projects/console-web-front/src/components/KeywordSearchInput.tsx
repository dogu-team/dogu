import React, { useState, useMemo, useEffect } from 'react';
import { Input } from 'antd';
import { SearchProps } from 'antd/lib/input';
import { debounce } from 'lodash';
import styled from 'styled-components';

interface Props extends SearchProps {
  onDebouncedChange: (value: string) => void | Promise<void>;
  onMount?: () => void;
  debounceMS?: number;
}

const KeywordSearchInput = ({ onDebouncedChange, debounceMS = 250, onMount, ...props }: Props) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    onMount?.();
  }, []);

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        onDebouncedChange(value);
      }, debounceMS),
    [onDebouncedChange, debounceMS],
  );

  const handleUpdate = (value: string) => {
    setValue(value);
    debouncedUpdate(value);
  };

  return <StyledSearchInput {...props} value={value} onChange={(e) => handleUpdate(e.target.value)} allowClear />;
};

export default React.memo(KeywordSearchInput);

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
