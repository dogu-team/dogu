import { Button, Input } from 'antd';
import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import useRunnerFilterStore, { defaultRunnerFilterValue } from 'src/stores/runner-filter';
import RunnerStatusSelector from './RunnerStatusSelector';
import RunnerTagSearchBox from './RunnerTagSearchBox';
import ProjectSearchBox from './ProjectSearchBox';
import SelectFilterDropdown from '../SelectFilterDropdown';

const RunnerSearchInput = () => {
  const { updateFilter } = useRunnerFilterStore();
  const [name, setName] = useState('');
  const { t } = useTranslation();

  const debouncedUpdateName = useMemo(
    () =>
      debounce((value: string) => {
        updateFilter({ name: () => value });
      }, 250),
    [],
  );

  const handleChangeName = (value: string) => {
    setName(value);
    debouncedUpdateName(value);
  };

  return <StyledSearchInput value={name} placeholder={t('runner:runnerFilterNamePlaceholder')} maxLength={50} onChange={(e) => handleChangeName(e.target.value)} allowClear />;
};

const RunnerFilter = () => {
  const { filterValue, resetFilter } = useRunnerFilterStore();
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  return (
    <Box>
      <RunnerSearchInput />

      <FlexBox>
        <SelectFilterDropdown title={t('runner:runnerFilterTagTitle')} selectedCount={filterValue.tags.length} menu={<RunnerTagSearchBox />} />
        <SelectFilterDropdown title={t('runner:runnerFilterProjectTitle')} selectedCount={filterValue.projects.length} menu={<ProjectSearchBox />} />
        <SelectFilterDropdown title={t('runner:runnerFilterStatusTitle')} selectedCount={filterValue.states.length} menu={<RunnerStatusSelector />} />

        <Button onClick={resetFilter} disabled={JSON.stringify(filterValue) === JSON.stringify(defaultRunnerFilterValue)}>
          {t('runner:runnerFilterClearTitle')}
        </Button>
      </FlexBox>
    </Box>
  );
};

export default RunnerFilter;

const Box = styled.div`
  display: flex;
  align-items: center;

  @media only screen and (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledSearchInput = styled(Input.Search)`
  width: 200px;
  margin-right: 0.25rem;

  @media only screen and (max-width: 767px) {
    margin-bottom: 0.25rem;
  }
`;

const FlexBox = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;

  & > * {
    margin-right: 0.25rem;
  }
`;
