import { MobileOutlined, TagOutlined } from '@ant-design/icons';
import { PageBase, DeviceTagBase, DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { Tabs } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../../api/index';
import useDebouncedInputValues from '../../../../hooks/useDebouncedInputValues';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../../../styles/box';
import PlatformIcon from '../../../device/PlatformIcon';
import AddWithSelect from './AddWithSelect';

enum TabMenu {
  DEVICE = '1',
  DEVICE_TAG = '2',
}

interface Props {
  onSelect: (value: string) => void;
  group: boolean;
  devicePlatform?: Platform;
}

const AddDeviceAndTagButton = ({ onSelect, group, devicePlatform }: Props) => {
  const [selectable, setSelectable] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabMenu>(group ? TabMenu.DEVICE_TAG : TabMenu.DEVICE);
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    data: tags,
    isLoading: tagsLoading,
    error: tagError,
  } = useSWR<PageBase<DeviceTagBase>>(selectable && currentTab === TabMenu.DEVICE_TAG && `/organizations/${router.query.orgId}/tags?keyword=${debouncedValue}`, swrAuthFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
  const {
    data: devices,
    isLoading: devicesLoading,
    error: deviceError,
  } = useSWR<PageBase<DeviceBase>>(
    selectable &&
      !group &&
      currentTab === TabMenu.DEVICE &&
      `/organizations/${router.query.orgId}/projects/${router.query.pid}/devices?keyword=${debouncedValue}${devicePlatform ? `&platform=${devicePlatform}` : ''}`,
    swrAuthFetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (group) {
      setCurrentTab(TabMenu.DEVICE_TAG);
    }
  }, [group]);

  return (
    <AddWithSelect
      options={
        currentTab === TabMenu.DEVICE_TAG
          ? tags?.items.map((item) => ({ value: item.name, label: item.name }))
          : devices?.items.map((item) => ({
              value: item.name,
              label: (
                <div>
                  <FlexRow>
                    <PlatformIcon platform={item.platform} />
                    <Version>{item.version}</Version>
                    <DeviceName>{item.name}</DeviceName>
                  </FlexRow>
                  <Model>{item.modelName ? `${item.modelName} (${item.model})` : item.model}</Model>
                </div>
              ),
            }))
      }
      onSelect={onSelect}
      selectable={selectable}
      onSelectableChange={setSelectable}
      loading={currentTab === TabMenu.DEVICE_TAG ? tagsLoading : devicesLoading}
      showSearch
      onSearch={handleChangeValues}
      placeholder={t('routine:routineGuiEditorJobDeviceTagSelectorPlaceholder')}
      dropdownRender={(menu) => {
        return (
          <>
            <Tabs
              activeKey={currentTab}
              onChange={(e) => {
                setCurrentTab(e as TabMenu);
                handleChangeValues('');
              }}
              items={[
                ...(group
                  ? []
                  : [
                      {
                        key: TabMenu.DEVICE,
                        label: 'Device',
                      },
                    ]),
                {
                  key: TabMenu.DEVICE_TAG,
                  label: 'Device tag',
                },
              ]}
            />
            <div>{menu}</div>
          </>
        );
      }}
      notFoundContent={
        <EmptyBox>
          {currentTab === TabMenu.DEVICE_TAG ? (
            <TagOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
          ) : (
            <MobileOutlined style={{ fontSize: '3rem', marginBottom: '1rem' }} />
          )}
          <EmptyText>
            {currentTab === TabMenu.DEVICE_TAG ? (
              <>
                No device tag.
                <br />
                Create your device tag from <Link href={`/dashboard/${router.query.orgId}/device-farm/tags`}>here</Link>
              </>
            ) : (
              <>
                No device.
                <br />
                Register your device from <Link href={`/dashboard/${router.query.orgId}/device-farm/devices`}>here</Link>
              </>
            )}
          </EmptyText>
        </EmptyBox>
      }
    />
  );
};

export default React.memo(AddDeviceAndTagButton);

const FlexRow = styled.div`
  ${flexRowBaseStyle}
  line-height: 1.5;
`;

const Version = styled.span`
  font-size: 0.8rem;
  margin: 0 0.15rem;
  color: #888;
`;

const DeviceName = styled.span`
  margin-left: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Model = styled.p`
  font-size: 0.75rem;
  color: #888;
`;

const EmptyBox = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
`;
