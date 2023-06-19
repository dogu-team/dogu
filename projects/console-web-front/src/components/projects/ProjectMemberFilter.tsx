import { Input } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { USER_NAME_MAX_LENGTH } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';

import useProjectMemberFilterStore from 'src/stores/project-member-filter';

const ProjectMemberFilter = () => {
  const [name, setName] = useState('');
  const [updateFilter, resetFilter] = useProjectMemberFilterStore((state) => [state.updateFilter, state.resetFilter]);
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
      <StyledSearchInput
        placeholder={t('project-member:projectMemberFilterPlaceholder')}
        onChange={(e) => handleChange(e.target.value)}
        value={name}
        allowClear
        maxLength={USER_NAME_MAX_LENGTH}
      />
    </Box>
  );
};

export default ProjectMemberFilter;

const Box = styled.div`
  display: flex;
  align-items: center;
`;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
`;
