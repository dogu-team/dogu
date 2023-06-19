import { useCallback } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import KeywordSearchInput from '../KeywordSearchInput';
import useTeamProjectFilterStore from 'src/stores/team-project-filter';

const TeamProjectFilter = () => {
  const [updateFilter, resetFilter] = useTeamProjectFilterStore((state) => [state.updateFilter, state.resetFilter]);
  const { t } = useTranslation();

  const handleUpdateProjectFilter = useCallback((value: string) => {
    updateFilter({ keyword: () => value });
  }, []);

  return (
    <Box>
      <KeywordSearchInput placeholder={t('team:projectFilterInputPlaceholder')} onDebouncedChange={handleUpdateProjectFilter} onMount={resetFilter} />
    </Box>
  );
};

export default TeamProjectFilter;

const Box = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
`;
