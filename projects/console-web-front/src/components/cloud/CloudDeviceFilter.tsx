import { Platform } from '@dogu-private/types';
import { Input, Select, SelectProps } from 'antd';
import { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../api';

import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import useCloudDeviceFilterStore from '../../stores/cloud-device-filter';
import { flexRowBaseStyle } from '../../styles/box';
import PlatformIcon from '../device/PlatformIcon';

const CloudDeviceFilter: React.FC = () => {
  const {
    inputValue: keyword,
    debouncedValue: debouncedKeyword,
    handleChangeValues: handleChangekeyword,
  } = useDebouncedInputValues();
  const [filterValue, updateFilter, resetFilter] = useCloudDeviceFilterStore((state) => [
    state.filterValue,
    state.updateFilter,
    state.resetFilter,
  ]);
  const { data, isLoading } = useSWR<string[]>(
    `/cloud-devices/versions?platform=${filterValue.platform || ''}`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    return () => {
      resetFilter();
    };
  }, []);

  useEffect(() => {
    updateFilter({ keyword: () => debouncedKeyword });
  }, [debouncedKeyword]);

  const platformOptions: SelectProps['options'] = [
    {
      label: (
        <FlexRow style={{ justifyContent: 'center', height: '100%' }}>
          <PlatformIcon platform={Platform.PLATFORM_ANDROID} hideTooltip />
          ,&nbsp;
          <PlatformIcon platform={Platform.PLATFORM_IOS} hideTooltip />
        </FlexRow>
      ),
      value: Platform.PLATFORM_UNSPECIFIED,
    },
    {
      label: (
        <FlexRow style={{ justifyContent: 'center', height: '100%' }}>
          <PlatformIcon platform={Platform.PLATFORM_ANDROID} hideTooltip />
        </FlexRow>
      ),
      value: Platform.PLATFORM_ANDROID,
    },
    {
      label: (
        <FlexRow style={{ justifyContent: 'center', height: '100%' }}>
          <PlatformIcon platform={Platform.PLATFORM_IOS} hideTooltip />
        </FlexRow>
      ),
      value: Platform.PLATFORM_IOS,
    },
  ];

  return (
    <FlexRow>
      <Select<Platform>
        options={platformOptions}
        dropdownMatchSelectWidth={false}
        defaultValue={Platform.PLATFORM_UNSPECIFIED}
        onChange={(value) => updateFilter({ platform: () => value })}
        style={{ marginRight: '.5rem' }}
      />
      <Select<string>
        options={[{ label: 'Versions', value: '' }].concat(
          data?.map((version) => ({ label: version, value: version })) || [],
        )}
        dropdownMatchSelectWidth={false}
        defaultValue={''}
        style={{ marginRight: '.5rem' }}
      />
      <Input.Search
        placeholder="Brand or name"
        allowClear
        value={keyword}
        onChange={(e) => handleChangekeyword(e.target.value)}
      />
    </FlexRow>
  );
};

export default CloudDeviceFilter;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
