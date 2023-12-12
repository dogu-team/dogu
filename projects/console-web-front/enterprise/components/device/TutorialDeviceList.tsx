import { DeviceBase } from '@dogu-private/console';
import { HostId, OrganizationId, ProjectId } from '@dogu-private/types';
import { Transfer } from 'antd';
import { TransferDirection, TransferItem } from 'antd/es/transfer';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import styled from 'styled-components';

import { enableDevice } from '../../api/device';
import usePaginationSWR from '../../../src/hooks/usePaginationSWR';
import useRefresh from '../../../src/hooks/useRefresh';
import { flexRowBaseStyle } from '../../../src/styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import DeviceConnectionStateTag from '../../../src/components/device/DeviceConnectionStateTag';
import PlatformIcon from '../../../src/components/device/PlatformIcon';
import { isPaymentRequired, isTimeout } from '../../utils/error';
import useModal from '../../../src/hooks/useModal';
import TimeoutDocsModal from '../license/TimeoutDocsModal';
import { UpgradeDevicePlanBannerModal } from '../license/UpgradePlanBannerModal';

interface Props {
  organizationId: OrganizationId;
  hostId: HostId;
}

const TutorialDeviceList = ({ organizationId, hostId }: Props) => {
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
  const [isBannerOpen, openBanner, closeBanner] = useModal();
  const [isDocsOtpen, openDocs, closeDocs] = useModal();
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
      await Promise.all(targetKeys.map((deviceId) => enableDevice(organizationId, deviceId, { isGlobal: false })));
      mutateStandbyDevices();
      mutateUsingDevices();
      sendSuccessNotification('Successfully use devices!');
    } catch (e) {
      if (isAxiosError(e)) {
        if (isPaymentRequired(e)) {
          close();
          openBanner();
        } else if (isTimeout(e)) {
          close();
          openDocs();
        } else {
          sendErrorNotification(`Failed to use devices\b${getErrorMessageFromAxios(e)}`);
        }
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
    <>
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

      <UpgradeDevicePlanBannerModal
        isOpen={isBannerOpen}
        close={closeBanner}
        title={t('billing:addDeviceModalTitle')}
        description={null}
      />
      <TimeoutDocsModal isOpen={isDocsOtpen} close={closeDocs} />
    </>
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
