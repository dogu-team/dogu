import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import useTeamMemberFilterStore from 'src/stores/team-member-filter';
import KeywordSearchInput from '../KeywordSearchInput';

const TeamMemberFilter = () => {
  const [updateFilter, resetFilter] = useTeamMemberFilterStore((state) => [state.updateFilter, state.resetFilter]);
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  const handleUpdateUserFilter = useCallback((value: string) => {
    updateFilter({ keyword: () => value });
  }, []);

  return (
    <Box>
      <KeywordSearchInput placeholder={t('team:memberFilterInputPlaceholder')} onDebouncedChange={handleUpdateUserFilter} onMount={resetFilter} />
    </Box>
  );
};

export default TeamMemberFilter;

const Box = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
`;
