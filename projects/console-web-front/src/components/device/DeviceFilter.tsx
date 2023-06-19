import { Button, Input } from 'antd';
import { debounce } from 'lodash';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import useDeviceFilterStore, { defaultDeviceFilterValue } from 'src/stores/device-filter';
import DeviceStatusSelector from './DeviceStatusSelector';
import DeviceTagSearchBox from './DeviceTagSearchBox';
import ProjectSearchBox from './ProjectSearchBox';
import SelectFilterDropdown from '../SelectFilterDropdown';

const DeviceSearchInput = () => {
  const { updateFilter } = useDeviceFilterStore();
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

  return <StyledSearchInput value={name} placeholder={t('device:deviceFilterNamePlaceholder')} maxLength={50} onChange={(e) => handleChangeName(e.target.value)} allowClear />;
};

const DeviceFilter = () => {
  const { filterValue, resetFilter } = useDeviceFilterStore();
  const { t } = useTranslation();

  useEffect(() => {
    resetFilter();
  }, []);

  return (
    <Box>
      <DeviceSearchInput />

      <FlexBox>
        <SelectFilterDropdown title={t('device:deviceFilterTagTitle')} selectedCount={filterValue.tags.length} menu={<DeviceTagSearchBox />} />
        <SelectFilterDropdown title={t('device:deviceFilterProjectTitle')} selectedCount={filterValue.projects.length} menu={<ProjectSearchBox />} />
        <SelectFilterDropdown title={t('device:deviceFilterStatusTitle')} selectedCount={filterValue.states.length} menu={<DeviceStatusSelector />} />

        <Button onClick={resetFilter} disabled={JSON.stringify(filterValue) === JSON.stringify(defaultDeviceFilterValue)}>
          {t('device:deviceFilterClearTitle')}
        </Button>
      </FlexBox>
    </Box>
  );
};

export default DeviceFilter;

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
