import { Input } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import useOrganizationMemberFilterStore from 'src/stores/organization-member-filter';
import useTranslation from 'next-translate/useTranslation';

const OrganizationMemberFilter = () => {
  const [name, setName] = useState('');
  const [updateFilter, resetFilter] = useOrganizationMemberFilterStore((state) => [state.updateFilter, state.resetFilter]);
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  const debouncedUpdateKeyword = useMemo(
    () =>
      debounce((value: string) => {
        updateFilter({ keyword: () => value });
      }, 250),
    [],
  );

  const handleChange = async (value: string) => {
    setName(value);
    debouncedUpdateKeyword(value);
  };

  return (
    <Box>
      <StyledSearchInput placeholder={t('org-member:memberFilterNamePlaceholder')} onChange={(e) => handleChange(e.target.value)} value={name} allowClear maxLength={50} />
    </Box>
  );
};

export default OrganizationMemberFilter;

const Box = styled.div`
  display: flex;
  align-items: center;
`;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
