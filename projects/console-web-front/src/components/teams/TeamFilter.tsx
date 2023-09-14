import { Input } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import useTeamFilterStore from 'src/stores/team-filter';

const TeamFilter = () => {
  const [value, setValue] = useState('');
  const [updateFilter, resetFilter] = useTeamFilterStore((state) => [state.updateFilter, state.resetFilter]);
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  const debouncedUpdateFilter = useMemo(
    () => debounce((value: string) => updateFilter({ keyword: () => value }), 250),
    [],
  );

  const handleChange = (value: string) => {
    setValue(value);
    debouncedUpdateFilter(value);
  };

  return (
    <Box>
      <StyledSearchInput
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t('team:teamFilterNamePlaceholder')}
        allowClear
      />
    </Box>
  );
};

export default TeamFilter;

const Box = styled.div`
  display: flex;
  align-items: center;
`;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
