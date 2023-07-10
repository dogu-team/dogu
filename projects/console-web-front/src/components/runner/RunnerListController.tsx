import { MobileOutlined } from '@ant-design/icons';
import { DeviceBase } from '@dogu-private/console';
import { List, MenuProps } from 'antd';
import { AxiosError } from 'axios';
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
import RunnerConnectionStateTag from './RunnerConnectionStateTag';
import RunnerDetailModal from './RunnerDetailModal';
import useRunnerFilterStore from 'src/stores/runner-filter';
import { getErrorMessage } from 'src/utils/error';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { menuItemButtonStyles } from '../../styles/button';
import useModal from '../../hooks/useModal';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import EditRunnerTagModal from './EditRunnerTagModal';
import EditRunnerModal from './EditRunnerModal';
import EditRunnerProjectModal from './EditRunnerProjectModal';
import RunnerName from './RunnerName';
import RunnerTagAndProject from './RunnerTagAndProject';
import useEventStore from '../../stores/events';
import { rebootRunner, disableDevice } from '../../api/device';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from './PlatformIcon';
import RunnerUsageStatusBadge from './RunnerUsageStatusBadge';

interface DeviceItemProps {
  device: DeviceBase;
}

const RunnerItem = ({ device }: DeviceItemProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();
  const [isEditDeviceModalOpen, openEditDeviceModal, closeEditDeviceModal] = useModal();
  const [isEditDeviceTagModalOpen, openEditDeviceTagModal, closeEditDeviceTagModal] = useModal();
  const [isEditDeviceProjectModalOpen, openEditDeviceProjectModal, closeEditDeviceProjectModal] = useModal();
  const [isDetailModlOpen, openDetailModal, closeDetailModal] = useModal();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const streamingable = device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
  const rebootable =
    (device.platform === Platform.PLATFORM_ANDROID || device.platform === Platform.PLATFORM_IOS) &&
    device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
  const isGlobalDevice = device.isGlobal === 1;

  const handleClickStop = async () => {
    try {
      await disableDevice(orgId, device.deviceId);
      sendSuccessNotification(t('runner:stopUsingRunnerSuccessMsg'));
      fireEvent('onDeviceStopped');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('runner:stopUsingRunnerFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleClickReboot = async () => {
    try {
      await rebootRunner(orgId, device.deviceId);
      sendSuccessNotification(t('runner:rebootRunnerSuccessMsg'));
      fireEvent('onDeviceReboot');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('runner:rebootRunnerFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <PrimaryLinkButton
          href={`/dashboard/${router.query.orgId}/runners/${device.deviceId}/streaming`}
          disabled={!streamingable}
          onClick={(e) => {
            if (!streamingable) {
              e.preventDefault();
            }
          }}
          onAuxClick={(e) => {
            if (!streamingable) {
              e.preventDefault();
            }
          }}
        >
          {t('runner:runnerItemStreamingMenu')}
        </PrimaryLinkButton>
      ),
      key: 'stream',
    },
    { type: 'divider' },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditDeviceModal()}>
          {t('runner:runnerItemEditMenu')}
        </MenuItemButton>
      ),
      key: 'edit',
    },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditDeviceTagModal()}>
          {t('runner:runnerItemEditTagMenu')}
        </MenuItemButton>
      ),
      key: 'edit-tag',
    },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditDeviceProjectModal()}>
          {t('runner:runnerItemEditProejctMenu')}
        </MenuItemButton>
      ),
      key: 'edit-projects',
    },
    { type: 'divider' },
    {
      label: (
        <MenuItemButton danger={false} disabled={!rebootable} onClick={handleClickReboot}>
          {t('runner:runnerItemRebootMenu')}
        </MenuItemButton>
      ),
      key: 'reboot',
    },
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleClickStop}
          modalTitle={t('runner:stopUsingRunnerModalTitle')}
          modalButtonTitle={t('runner:stopUsingRunnerModalButtonText')}
          modalContent={<p>{t('runner:stopUsingRunnerModalContent')}</p>}
        >
          {t('runner:runnerItemStopUsingMenu')}
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
            <RunnerName runner={device} onClick={handleClickDetail} />
          </NameCell>
          <StatusCell>
            <RunnerConnectionStateTag connectionState={device.connectionState} />
          </StatusCell>
          <StatusCell>
            <RunnerUsageStatusBadge runner={device} />
          </StatusCell>
          <PlatformCell>
            <DeviceInfo>
              <PlatformIcon platform={device.platform} />
              &nbsp;
              {device.version}
            </DeviceInfo>
            <DeviceInfo>
              {device.modelName} {`(${device.model})`}
            </DeviceInfo>
          </PlatformCell>
          <InfoCell>
            <FlexSpaceBetweenBox>
              <RunnerTagAndProject
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

      <EditRunnerModal runner={device} isOpen={isEditDeviceModalOpen} close={closeEditDeviceModal} />
      <RunnerDetailModal isOpen={isDetailModlOpen} runner={device} close={closeDetailModal} />
      <EditRunnerTagModal runnerId={device.deviceId} isOpen={isEditDeviceTagModalOpen} close={closeEditDeviceTagModal} />
      <EditRunnerProjectModal runnerId={device.deviceId} isOpen={isEditDeviceProjectModalOpen} close={closeEditDeviceProjectModal} isGlobal={isGlobalDevice} />
    </>
  );
};

const RunnerListController = () => {
  const router = useRouter();
  const organizationId = router.query.orgId;
  const { filterValue } = useRunnerFilterStore();
  const { data, error, mutate, page, updatePage, isLoading } = usePaginationSWR<DeviceBase>(
    organizationId
      ? `/organizations/${organizationId}/devices?deviceName=${
          filterValue.name
        }&tagNames=${filterValue.tags.join()}&connectionStates=${filterValue.states.join()}&projectIds=${filterValue.projects.map((item) => item.projectId).join()}`
      : null,
    {
      skipQuestionMark: true,
    },
  );
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onDeviceTagUpdated', 'onDeviceAdded', 'onDeviceUpdated', 'onAddDeviceToProjectModalClosed', 'onDeviceStopped', 'onDeviceReboot'], mutate);

  if (error) {
    if (error instanceof AxiosError) {
      return <ErrorBox title="Oops..." desc={getErrorMessage(error)} />;
    }
  }

  return (
    <>
      <Header>
        <DeviceItemInner>
          <NameCell>{t('runner:runnerTableNameColumn')}</NameCell>
          <StatusCell>{t('runner:runnerTableConnectionStatusColumn')}</StatusCell>
          <StatusCell>{t('runner:runnerTableRunningStatusColumn')}</StatusCell>
          <PlatformCell>{t('runner:runnerTablePlatformAndModalColumn')}</PlatformCell>
          <InfoCell>{t('runner:runnerTableTagsAndProjectsColumn')}</InfoCell>
        </DeviceItemInner>
      </Header>
      <List<DeviceBase>
        itemLayout="horizontal"
        dataSource={data?.items}
        renderItem={(item) => {
          return <RunnerItem device={item} />;
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
                  i18nKey="runner:runnerEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/management/organization/device/device-management" target="_blank" /> }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default RunnerListController;

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
