import { Input } from 'antd';
import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import useHostFilterStore from 'src/stores/host-filter';

const HostFilter = () => {
  const [value, setValue] = useState('');
  const [updateFilter, resetFilter] = useHostFilterStore((state) => [state.updateFilter, state.resetFilter]);
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  const debouncedUpdateFilter = useMemo(
    () =>
      debounce((value: string) => {
        updateFilter({ keyword: () => value });
      }, 250),
    [],
  );

  const handleChange = (value: string) => {
    setValue(value);
    debouncedUpdateFilter(value);
  };

  return (
    <Box>
      <StyledSearchInput value={value} placeholder={t('device-farm:hostFilterNamePlaceholder')} onChange={(e) => handleChange(e.target.value)} allowClear />
    </Box>
  );
};

export default HostFilter;

const Box = styled.div`
  display: flex;
`;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
