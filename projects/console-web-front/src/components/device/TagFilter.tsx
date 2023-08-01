import { Input } from 'antd';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import useTagFilterStore from 'src/stores/tag-filter';

const TagFilter = () => {
  const [name, setName] = useState('');
  const updateFilter = useTagFilterStore((state) => state.updateFilter);
  const { t } = useTranslation();

  const debouncedUpdateName = useMemo(
    () =>
      debounce((value: string) => {
        updateFilter({ keyword: () => value });
      }, 250),
    [],
  );

  const handleChange = async (value: string) => {
    setName(value);
    debouncedUpdateName(value);
  };

  return (
    <Box>
      <StyledSearchInput placeholder={t('device-farm:tagFilterNamePlaceholder')} onChange={(e) => handleChange(e.target.value)} value={name} allowClear maxLength={50} />
    </Box>
  );
};

export default TagFilter;

const Box = styled.div`
  display: flex;
  align-items: center;
`;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
