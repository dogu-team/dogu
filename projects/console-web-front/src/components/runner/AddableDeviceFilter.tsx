import { Input } from 'antd';
import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import useUnallowedDeviceFilterStore from 'src/stores/unallowed-device-filter';

const AddableDeviceFilter = () => {
  const [name, setName] = useState('');
  const updateFilter = useUnallowedDeviceFilterStore((state) => state.updateFilter);
  const { t } = useTranslation();

  const debouncedUpdateKeyword = useMemo(
    () =>
      debounce((keyword: string) => {
        updateFilter({ name: () => keyword });
      }, 250),
    [],
  );

  const handleChange = useCallback(
    (value: string) => {
      setName(value);
      debouncedUpdateKeyword(value);
    },
    [debouncedUpdateKeyword],
  );

  return <StyledSearchInput value={name} onChange={(e) => handleChange(e.target.value)} allowClear placeholder={t('runner:runnerFilterNamePlaceholder')} />;
};

export default AddableDeviceFilter;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
