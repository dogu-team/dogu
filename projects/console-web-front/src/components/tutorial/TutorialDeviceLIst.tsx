import { DeviceBase } from '@dogu-private/console';
import { HostId, OrganizationId, ProjectId } from '@dogu-private/types';
import { Transfer } from 'antd';
import { TransferDirection, TransferItem } from 'antd/es/transfer';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import styled from 'styled-components';
import { enableDevice } from '../../api/device';

import usePaginationSWR from '../../hooks/usePaginationSWR';
import useRefresh from '../../hooks/useRefresh';
import { flexRowBaseStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import DeviceConnectionStateTag from '../device/DeviceConnectionStateTag';
import PlatformIcon from '../device/PlatformIcon';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  hostId: HostId;
}

const TutorialDeviceList = ({ organizationId, projectId, hostId }: Props) => {
  const {
    data: stanbyDevices,
    error: standbyDeviceError,
    mutate: mutateStandbyDevices,
    page: standbyDevicePage,
    updatePage: updateStanbyDevicePage,
    isLoading: isStandbyDeviceLoading,
  } = usePaginationSWR<DeviceBase>(
    organizationId ? `/organizations/${organizationId}/devices/addable?hostId=${hostId}` : null,
    {
      skipQuestionMark: true,
      offset: 20,
    },
    {
      revalidateOnFocus: false,
    },
  );
  const {
    data: usingDevices,
    error: usingDeviceError,
    mutate: mutateUsingDevices,
    page: usingDevicePage,
    updatePage: updateUsingDevicePage,
    isLoading: isUsingDeviceLoading,
  } = usePaginationSWR<DeviceBase>(
    organizationId ? `/organizations/${organizationId}/devices?hostId=${hostId}` : null,
    {
      skipQuestionMark: true,
      offset: 20,
    },
    {
      revalidateOnFocus: false,
    },
  );
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('tutorial');

  useRefresh(['onRefreshClicked'], async () => {
    mutateStandbyDevices();
    mutateUsingDevices();
  });

  const handleChange = async (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
    if (targetKeys.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        targetKeys.map((deviceId) => enableDevice(organizationId, deviceId, { projectId, isGlobal: false })),
      );
      mutateStandbyDevices();
      mutateUsingDevices();
      sendSuccessNotification('Successfully use devices!');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to use devices\b${getErrorMessageFromAxios(e)}`);
      }
    }
    setLoading(false);
  };

  const data: TransferItem[] =
    usingDevices?.items
      .map((device) => ({
        key: device.deviceId,
        title: `${device.modelName || device.model}`,
        description: device.modelName || device.model,
        disabled: false,
      }))
      .concat(
        stanbyDevices?.items.map((device) => ({
          key: device.deviceId,
          title: `${device.modelName || device.model}`,
          description: device.modelName || device.model,
          disabled: false,
        })) ?? [],
      ) ?? [];

  const devices = usingDevices?.items.concat(stanbyDevices?.items ?? []);

  return (
    <StyledTransfer
      dataSource={data}
      titles={[
        <StyledTitle key="source">{t('deviceFarmTutorialUseDeviceTableStandbyTitle')}</StyledTitle>,
        <StyledTitle key="target">{t('deviceFarmTutorialUseDeviceTableInUseTitle')}</StyledTitle>,
      ]}
      oneWay
      render={(item) => {
        const device = devices?.find((d) => d.deviceId === item.key);
        if (!device) {
          return null;
        }

        return (
          <FlexRow>
            <DeviceConnectionStateTag connectionState={device.connectionState} />
            &nbsp;
            <PlatformIcon platform={device.platform} />
            {`${device.version} |`}
            &nbsp;
            {device.modelName}
          </FlexRow>
        );
      }}
      targetKeys={usingDevices?.items.map((device) => device.deviceId)}
      onChange={handleChange}
      disabled={loading}
    />
  );
};

export default TutorialDeviceList;

const StyledTransfer = styled(Transfer)`
  .ant-transfer-list {
    width: 50%;
  }

  .ant-transfer-list-content-item-remove {
    display: none !important;
  }
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StyledTitle = styled.b`
  font-weight: 500;
`;
