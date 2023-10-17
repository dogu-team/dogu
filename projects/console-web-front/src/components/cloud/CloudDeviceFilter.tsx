import { Platform } from '@dogu-private/types';
import { Input, Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import useCloudDeviceFilterStore from '../../stores/cloud-device-filter';
import { flexRowBaseStyle } from '../../styles/box';
import PlatformIcon from '../device/PlatformIcon';

const VersionSelect: React.FC = () => {
  const [platform, version, updateFilter] = useCloudDeviceFilterStore((state) => [
    state.filterValue.platform,
    state.filterValue.version,
    state.updateFilter,
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, mutate } = useSWR<string[]>(
    isOpen && `/cloud-devices/versions?platform=${platform || ''}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return (
    <Select<string>
      options={[{ label: 'Versions', value: '' }].concat(
        data?.map((version) => ({ label: version, value: version })) || [],
      )}
      dropdownMatchSelectWidth={false}
      defaultValue={''}
      style={{ marginRight: '.5rem' }}
      value={version}
      onChange={(value) => updateFilter({ version: () => value })}
      loading={isLoading}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    />
  );
};

const CloudDeviceFilter: React.FC = () => {
  const {
    inputValue: keyword,
    debouncedValue: debouncedKeyword,
    handleChangeValues: handleChangekeyword,
  } = useDebouncedInputValues();
  const [updateFilter, resetFilter] = useCloudDeviceFilterStore((state) => [state.updateFilter, state.resetFilter]);

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
      label: <FlexRow style={{ justifyContent: 'center', height: '100%' }}>Platform</FlexRow>,
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
        onChange={(value) => updateFilter({ platform: () => value, version: () => '' })}
        style={{ marginRight: '.5rem' }}
      />
      <VersionSelect />
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
