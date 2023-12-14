import { Platform } from '@dogu-private/types';
import { Button, Input, Radio, Select, SelectProps, Space } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { shallow } from 'zustand/shallow';

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
  const { data, isLoading } = useSWR<string[]>(
    isOpen && `/cloud-devices/versions?platform=${platform || ''}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const { t } = useTranslation('cloud-device');

  return (
    <Select<string>
      options={[{ label: t('cloudDeviceFilterVersionDefaultLabel'), value: '' }].concat(
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
  const [platform, updateFilter, resetFilter] = useCloudDeviceFilterStore(
    (state) => [state.filterValue.platform, state.updateFilter, state.resetFilter],
    shallow,
  );
  const { t } = useTranslation('cloud-device');

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
          {t('cloudDeviceFilterPlatformDefaultLabel')}
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
      {/* <Select<Platform>
        options={platformOptions}
        dropdownMatchSelectWidth={false}
        defaultValue={Platform.PLATFORM_UNSPECIFIED}
        onChange={(value) => updateFilter({ platform: () => value, version: () => '' })}
        style={{ marginRight: '.5rem' }}
      /> */}
      <Space.Compact style={{ marginRight: '.5rem' }}>
        <Button
          type={platform === Platform.PLATFORM_ANDROID ? 'primary' : 'default'}
          icon={<PlatformIcon platform={Platform.PLATFORM_ANDROID} hideTooltip />}
          style={{ width: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => updateFilter({ platform: () => Platform.PLATFORM_ANDROID, version: () => '' })}
        >
          Android
        </Button>
        <Button
          type={platform === Platform.PLATFORM_IOS ? 'primary' : 'default'}
          icon={<PlatformIcon platform={Platform.PLATFORM_IOS} hideTooltip />}
          style={{ width: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => updateFilter({ platform: () => Platform.PLATFORM_IOS, version: () => '' })}
        >
          iOS
        </Button>
      </Space.Compact>
      <VersionSelect />
      <Input.Search
        placeholder={t('cloudDeviceFilterSearchInputPlaceholder')}
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
