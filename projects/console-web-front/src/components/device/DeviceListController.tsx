import { MobileOutlined } from '@ant-design/icons';
import { DeviceBase } from '@dogu-private/console';
import { List, MenuProps } from 'antd';
import { AxiosError, isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { DeviceConnectionState, OrganizationId, Platform } from '@dogu-private/types';
import { useCallback } from 'react';
import Trans from 'next-translate/Trans';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import ErrorBox from '../common/boxes/ErrorBox';
import DeviceConnectionStateTag from './DeviceConnectionStateTag';
import DeviceDetailModal from './DeviceDetailModal';
import useDeviceFilterStore from 'src/stores/device-filter';
import { getErrorMessageFromAxios } from 'src/utils/error';
import {
  flexRowBaseStyle,
  flexRowSpaceBetweenStyle,
  listItemStyle,
  tableCellStyle,
  tableHeaderStyle,
} from '../../styles/box';
import { menuItemButtonStyles } from '../../styles/button';
import useModal from '../../hooks/useModal';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import EditDeviceTagModal from './EditDeviceTagModal';
import DeviceSettingModal from './DeviceSettingModal';
import EditDeviceProjectModal from '../../../enterprise/components/device/EditDeviceProjectModal';
import DeviceName from './DeviceName';
import DeviceTagAndProject from './DeviceTagAndProject';
import useEventStore from '../../stores/events';
import { rebootDevice, disableDevice } from '../../api/device';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from './PlatformIcon';
import DeviceUsageStatusBadge from './DeviceUsageStatusBadge';
import DeviceVersionAlertIcon from './DeviceVersionAlertIcon';
import { useDeviceCount } from '../../../enterprise/api/device';
import HostDeviceRunnerSettingModal from '../../../enterprise/components/device/HostDeviceRunnerSettingModal';
import { isDesktop } from '../../utils/device';
import useOrganizationContext from '../../hooks/context/useOrganizationContext';
import DeviceCounter from './DeviceCounter';

interface DeviceItemProps {
  device: DeviceBase;
}

const DeviceItem = ({ device }: DeviceItemProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();
  const [isDeviceSettingModalOpen, openDeviceSettingModal, closeDeviceSettingModal] = useModal();
  const [isHostDeviceRunnerModalOpen, openHostDeviceRunnerModal, closeHostDeviceRunnerModal] = useModal();
  const [isEditDeviceTagModalOpen, openEditDeviceTagModal, closeEditDeviceTagModal] = useModal();
  const [isEditDeviceProjectModalOpen, openEditDeviceProjectModal, closeEditDeviceProjectModal] = useModal();
  const [isDetailModlOpen, openDetailModal, closeDetailModal] = useModal();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const rebootable =
    (device.platform === Platform.PLATFORM_ANDROID || device.platform === Platform.PLATFORM_IOS) &&
    device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
  const isGlobalDevice = device.isGlobal === 1;

  const handleClickStop = async () => {
    try {
      await disableDevice(orgId, device.deviceId);
      sendSuccessNotification(t('device-farm:stopUsingDeviceSuccessMsg'));
      fireEvent('onDeviceStopped');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:stopUsingDeviceFailureMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const handleClickReboot = async () => {
    try {
      await rebootDevice(orgId, device.deviceId);
      sendSuccessNotification(t('device-farm:rebootDeviceSuccessMsg'));
      fireEvent('onDeviceReboot');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:rebootDeviceFailureMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditDeviceTagModal()} id={`${device.name}-edit-tag-menu-btn`}>
          {t('device-farm:deviceItemEditTagMenu')}
        </MenuItemButton>
      ),
      key: 'edit-tag',
    },
    {
      label: (
        <MenuItemButton
          danger={false}
          onClick={() => openEditDeviceProjectModal()}
          id={`${device.name}-edit-project-menu-btn`}
        >
          {t('device-farm:deviceItemEditProejctMenu')}
        </MenuItemButton>
      ),
      key: 'edit-projects',
    },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openDeviceSettingModal()} id={`${device.name}-setting-menu-btn`}>
          {t('device-farm:deviceItemSettingMenu')}
        </MenuItemButton>
      ),
      key: 'setting',
    },
    isDesktop(device)
      ? {
          label: (
            <MenuItemButton
              danger={false}
              onClick={() => openHostDeviceRunnerModal()}
              id={`${device.name}-runner-setting-menu-btn`}
            >
              {t('device-farm:deviceItemRunnerSettingMenu')}
            </MenuItemButton>
          ),
          key: 'runner-setting',
        }
      : null,
    { type: 'divider' },
    {
      label: (
        <MenuItemButton danger={false} disabled={!rebootable} onClick={handleClickReboot}>
          {t('device-farm:deviceItemRebootMenu')}
        </MenuItemButton>
      ),
      key: 'reboot',
    },
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleClickStop}
          modalTitle={t('device-farm:stopUsingDeviceModalTitle')}
          modalButtonTitle={t('device-farm:stopUsingDeviceModalButtonText')}
          modalContent={<p>{t('device-farm:stopUsingDeviceModalContent')}</p>}
          id={`${device.name}-stop-using-device-menu-btn`}
          confirmButtonId="stop-using-device-confirm-btn"
        >
          {t('device-farm:deviceItemStopUsingMenu')}
        </MenuItemButton>
      ),
      key: 'unuse',
    },
  ];

  const handleClickDetail = useCallback(() => openDetailModal(), [openDetailModal]);

  return (
    <>
      <Item key={`device-${device.deviceId}`}>
        <DeviceItemInner>
          <NameCell>
            <DeviceName device={device} onClick={handleClickDetail} />
          </NameCell>
          <StatusCell>
            <DeviceConnectionStateTag connectionState={device.connectionState} />
          </StatusCell>
          <StatusCell>
            <DeviceUsageStatusBadge device={device} />
          </StatusCell>
          <PlatformCell>
            <DeviceInfo>
              <PlatformIcon platform={device.platform} />
              &nbsp;
              {device.version}
              &nbsp;
              <DeviceVersionAlertIcon device={device} />
            </DeviceInfo>
            <DeviceInfo>
              {device.modelName} {`(${device.model})`}
            </DeviceInfo>
          </PlatformCell>
          <InfoCell>
            <FlexSpaceBetweenBox>
              <DeviceTagAndProject
                tagCount={device.deviceTags?.length}
                projectCount={isGlobalDevice ? undefined : device.projects?.length}
                onProjectClick={handleClickDetail}
                onTagClick={handleClickDetail}
              />
              <MenuButton menu={{ items }} />
            </FlexSpaceBetweenBox>
          </InfoCell>
        </DeviceItemInner>
      </Item>

      <DeviceSettingModal device={device} isOpen={isDeviceSettingModalOpen} close={closeDeviceSettingModal} />
      <HostDeviceRunnerSettingModal
        device={device}
        isOpen={isHostDeviceRunnerModalOpen}
        close={closeHostDeviceRunnerModal}
      />
      <DeviceDetailModal isOpen={isDetailModlOpen} device={device} close={closeDetailModal} />
      <EditDeviceTagModal
        deviceId={device.deviceId}
        isOpen={isEditDeviceTagModalOpen}
        close={closeEditDeviceTagModal}
      />
      <EditDeviceProjectModal
        device={device}
        isOpen={isEditDeviceProjectModalOpen}
        close={closeEditDeviceProjectModal}
        isGlobal={isGlobalDevice}
      />
    </>
  );
};

const DeviceListController = () => {
  const router = useRouter();
  const organizationId = router.query.orgId;
  const { filterValue } = useDeviceFilterStore();
  const { data, error, mutate, page, updatePage, isLoading } = usePaginationSWR<DeviceBase>(
    organizationId
      ? `/organizations/${organizationId}/devices?deviceName=${
          filterValue.name
        }&tagNames=${filterValue.tags.join()}&connectionStates=${filterValue.states.join()}&projectIds=${filterValue.projects
          .map((item) => item.projectId)
          .join()}`
      : null,
    {
      skipQuestionMark: true,
    },
  );
  const { t } = useTranslation();

  useRefresh(
    [
      'onRefreshClicked',
      'onDeviceTagUpdated',
      'onDeviceAdded',
      'onDeviceUpdated',
      'onAddDeviceToProjectModalClosed',
      'onDeviceStopped',
      'onDeviceReboot',
    ],
    () => {
      mutate();
    },
  );

  if (error) {
    return (
      <ErrorBox
        title="Something went wrong"
        desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get devices information'}
      />
    );
  }

  return (
    <>
      <div style={{ marginBottom: '.5rem' }}>
        <DeviceCounter />
      </div>
      <Header>
        <DeviceItemInner>
          <NameCell>{t('device-farm:deviceTableNameColumn')}</NameCell>
          <StatusCell>{t('device-farm:deviceTableConnectionStatusColumn')}</StatusCell>
          <StatusCell>{t('device-farm:deviceTableRunningStatusColumn')}</StatusCell>
          <PlatformCell>{t('device-farm:deviceTablePlatformAndModalColumn')}</PlatformCell>
          <InfoCell>{t('device-farm:deviceTableTagsAndProjectsColumn')}</InfoCell>
        </DeviceItemInner>
      </Header>
      <List<DeviceBase>
        itemLayout="horizontal"
        dataSource={data?.items}
        renderItem={(item) => {
          return <DeviceItem device={item} />;
        }}
        rowKey={(item) => `device-${item.deviceId}`}
        loading={isLoading}
        pagination={{
          defaultCurrent: 1,
          pageSize: 10,
          current: page || 1,
          onChange: (p) => {
            scrollTo(0, 0);
            updatePage(p);
          },
          total: data?.totalCount,
        }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<MobileOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="device-farm:deviceEmptyDescription"
                  components={{
                    br: <br />,
                    tutorialLink: <Link href={`/dashboard/${router.query.orgId}/get-started`} />,
                    link: (
                      <Link
                        href="https://docs.dogutech.io/management/organization/device-farm/device-management"
                        target="_blank"
                      />
                    ),
                  }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default DeviceListController;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const Cell = styled.div`
  ${tableCellStyle}
`;

const NameCell = styled(Cell)`
  flex: 2.5;
`;

const StatusCell = styled(Cell)`
  flex: 1.5;
`;

const PlatformCell = styled(Cell)`
  flex: 2;
`;

const InfoCell = styled(Cell)`
  flex: 2;
  margin-right: 0;
`;

const DeviceItemInner = styled.div`
  width: 100%;
  ${flexRowBaseStyle}
`;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const DeviceInfo = styled.p`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  margin: 0.4rem 0;
`;

const PrimaryLinkButton = styled(Link)<{ disabled: boolean }>`
  display: block;
  ${menuItemButtonStyles}
  width: 100%;
  color: ${(props) => (props.disabled ? '#00000040' : props.theme.colorPrimary)} !important;
  background-color: ${(props) => (props.disabled ? '#0000000a' : '#fff')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${(props) => (props.disabled ? '#0000000a' : props.theme.colorPrimary)};
    color: ${(props) => (props.disabled ? '#00000040' : '#fff')} !important;
  }
`;
