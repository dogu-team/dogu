import { MAX_TAG_NAMES_FILTER_LENGTH, PageBase, DeviceTagBase } from '@dogu-private/console';
import { Input, message } from 'antd';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';

import { swrAuthFetcher } from 'src/api';
import useDeviceFilterStore from 'src/stores/device-filter';
import { FilterSelectedTag, FilterSelectOption, SelectFilterDropdownMenu } from '../SelectFilterDropdown';
import { sendErrorNotification } from '../../utils/antd';

const DeviceTagSearchBox = () => {
  const router = useRouter();
  const organizationId = router.query.orgId;
  const [keyword, setKeyword] = useState('');
  const [name, setName] = useState('');
  const { filterValue, updateFilter } = useDeviceFilterStore();
  const { data, error, isLoading } = useSWR<PageBase<DeviceTagBase>>(organizationId && `/organizations/${organizationId}/tags?offset=5&keyword=${keyword}`, swrAuthFetcher, {
    keepPreviousData: true,
  });
  const { t } = useTranslation();

  const debouncedUpdateKeyword = useMemo(
    () =>
      debounce((value) => {
        setKeyword(value);
      }, 250),
    [],
  );

  const handleChange = (value: string) => {
    setName(value);
    debouncedUpdateKeyword(value);
  };

  const handleRemoveSelected = useCallback((value: string) => updateFilter({ tags: (prev) => prev.filter((ft) => ft !== value) }), []);

  const handleToggleOption = (value: string) => {
    if (filterValue.tags.includes(value)) {
      updateFilter({ tags: (prev) => prev.filter((t) => t !== value) });
    } else {
      updateFilter({
        tags: (prev) => {
          if (prev.length >= MAX_TAG_NAMES_FILTER_LENGTH) {
            sendErrorNotification(`You can select max ${MAX_TAG_NAMES_FILTER_LENGTH}`);
            return prev;
          }

          return [...prev, value];
        },
      });
    }
  };

  return (
    <StyledSelectFilterDropdownMenu
      title={t('device:deviceFilterTagSearchTitle')}
      input={<Input.Search value={name} onChange={(e) => handleChange(e.target.value)} placeholder={t('device:deviceFilterTagSearchPlaceholder')} allowClear loading={isLoading} />}
      selectedItems={filterValue.tags.map((item) => {
        return <FilterSelectedTag key={`tag-filter-${item}`} value={item} onClick={handleRemoveSelected} />;
      })}
      optionItems={data?.items.map((item) => (
        <FilterSelectOption key={`search-${item.deviceTagId}`} checked={filterValue.tags.includes(item.name)} onClick={() => handleToggleOption(item.name)}>
          {item.name}
        </FilterSelectOption>
      ))}
    />
  );
};

export default DeviceTagSearchBox;

const StyledSelectFilterDropdownMenu = styled(SelectFilterDropdownMenu)`
  width: 250px;
`;
