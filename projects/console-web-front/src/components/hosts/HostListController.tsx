import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { HostBase } from '@dogu-private/console';
import { HostConnectionState, OrganizationId } from '@dogu-private/types';
import { Alert, List, MenuProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import { useState } from 'react';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import HostStateTag from './HostStateTag';
import HostDetailModal from './HostDetailModal';
import useRefresh from 'src/hooks/useRefresh';
import useHostFilterStore from 'src/stores/host-filter';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import useModal from '../../hooks/useModal';
import { listActiveNameStyle } from '../../styles/text';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import EditHostModal from './EditHostModal';
import { deleteHost, reissuesHostConnectionToken, stopUsingHostAsDevice, updateUseHostAsDevice, updateHostApp } from '../../api/host';
import { getErrorMessage } from '../../utils/error';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from '../device/PlatformIcon';
import TokenCopyInput from '../common/TokenCopyInput';
import { menuItemButtonStyles } from '../../styles/button';
import useRequest from '../../hooks/useRequest';
import HostVesrsionBadge from './HostVersionBadge';

interface HostItemProps {
  host: HostBase;
}

const HostItem = ({ host }: HostItemProps) => {
  const router = useRouter();
  const [isDetailOpen, openDetailModal, closeDetailModal] = useModal();
  const [isEditModalOpen, openEditModal, closeEditModal] = useModal();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();
  const [token, setToken] = useState<string>();
  const [loading, request] = useRequest(updateUseHostAsDevice);
  const [updateLoading, updateRequest] = useRequest(updateHostApp);

  const fireEvent = useEventStore((state) => state.fireEvent);

  const streamingable = host.hostDevice?.deviceId && host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED;
  const isUsing = host.hostDevice && host.hostDevice.enableHostDevice === 1;

  const handleReissueToken = async () => {
    try {
      const token = await reissuesHostConnectionToken(orgId, host.hostId);
      setToken(token);
      sendSuccessNotification(t('device-farm:hostRevokeTokenSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:hostRevokeTokenFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleDeleteHost = async () => {
    try {
      await deleteHost(orgId, host.hostId);
      sendSuccessNotification(t('device-farm:hostDeleteSuccessMsg'));
      fireEvent('onHostDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:hostDeleteFailedMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleUseHostDevice = async () => {
    try {
      await request(orgId, host.hostId);
      sendSuccessNotification(t('device-farm:hostStartUsingSuccessMsg'));
      fireEvent('onHostDeviceUsed');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:hostStartUsingFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleStopUseHostDevice = async () => {
    try {
      await stopUsingHostAsDevice(orgId, host.hostId);
      sendSuccessNotification(t('device-farm:hostStopUsingSuccessMsg'));
      fireEvent('onHostDeviceStopped');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:hostStopUsingFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleHostAppUpdate = async () => {
    try {
      await updateRequest(orgId, host.hostId);
      sendSuccessNotification(t('device-farm:hostUpdateSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:hostUpdateFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const basicItems: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditModal()}>
          {t('device-farm:hostItemEditMenu')}
        </MenuItemButton>
      ),
      key: 'edit',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <MenuItemButton
          danger
          modalTitle={t('device-farm:hostTokenRevokeModalTitle')}
          modalButtonTitle={t('device-farm:hostTokenRevokeModalConfirmButtonTitle')}
          modalContent={
            token ? (
              <div access-id="host-token-revoke-alert">
                <Alert
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  type="success"
                  showIcon
                  message={
                    <Trans
                      i18nKey="device-farm:hostRevokeAfterDescription"
                      components={{ br: <br />, link: <Link href="https://docs.dogutech.io/device-farm/host" target="_blank" /> }}
                    />
                  }
                />

                <div style={{ marginTop: '1rem' }}>
                  <p>{t('device-farm:hostCreateModalTokenDescription')}</p>
                  <TokenCopyInput value={token} />
                  <p style={{ fontSize: '.8rem', lineHeight: '1.4' }}>* {t('device-farm:hostCreateModalTokenCheckDescription')}</p>
                </div>
              </div>
            ) : (
              <p style={{ lineHeight: 1.4 }}>{t('device-farm:hostTokenRevokeModalContent')}</p>
            )
          }
          onConfirm={handleReissueToken}
          footer={token ? null : undefined}
          onClose={() => setToken(undefined)}
          persistOpen
          confirmButtonId="host-token-revoke-confirm-btn"
        >
          {t('device-farm:hostItemRevokeTokenMenu')}
        </MenuItemButton>
      ),
      key: 'token',
    },
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleHostAppUpdate}
          modalTitle={t('device-farm:hostItemUpdateMenu')}
          modalButtonTitle={t('device-farm:hostUpdateModalButtonText')}
          modalContent={<StyledDeleteModalContent>{t('device-farm:hostUpdateModalContentInfo')}</StyledDeleteModalContent>}
          confirmButtonId="host-update-confirm-btn"
        >
          {t('device-farm:hostItemUpdateMenu')}
        </MenuItemButton>
      ),
      key: 'update',
    },
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDeleteHost}
          modalTitle={t('device-farm:hostDeleteModalTitle')}
          modalButtonTitle={t('device-farm:hostDeleteModalButtonText')}
          modalContent={
            <StyledDeleteModalContent>
              {t('device-farm:hostDeleteModalContentInfo')}
              <br />
              <br />
              {!!host.devices &&
                (host.devices.length < 2 ? (
                  <Trans
                    i18nKey="device-farm:hostDeleteModalContentCountSingular"
                    components={[<b key={`host-${host.hostId}-ds`} />]}
                    values={{ name: host.name, count: host.devices.length }}
                  />
                ) : (
                  <Trans
                    i18nKey="device-farm:hostDeleteModalContentCountPlural"
                    components={[<b key={`host-${host.hostId}-dp`} />]}
                    values={{ name: host.name, count: host.devices.length }}
                  />
                ))}
            </StyledDeleteModalContent>
          }
          confirmButtonId="host-delete-confirm-btn"
        >
          {t('device-farm:hostItemDeleteMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  const pendingUsageItems: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger={false}
          primary
          disabled={loading}
          onClick={() => {
            handleUseHostDevice();
          }}
        >
          {t('device-farm:hostItemStartUseMenu')}
        </MenuItemButton>
      ),
      key: 'startUsing',
    },
    ...basicItems,
  ];

  const stopUsageItems: MenuProps['items'] = [
    ...basicItems.slice(0, basicItems.length - 2),
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleStopUseHostDevice}
          modalTitle={t('device-farm:hostStopUsingModalTitle')}
          modalButtonTitle={t('device-farm:hostStopUsingModalButtontText')}
          modalContent={t('device-farm:hostStopUsingModalContentInfo')}
        >
          {t('device-farm:hostItemStopUseMenu')}
        </MenuItemButton>
      ),
      key: 'stopUsing',
    },
    ...basicItems.slice(basicItems.length - 2),
  ];

  return (
    <>
      <Item>
        <ItemInner>
          <NameCell>
            <FlexRowBox>
              <HostName onClick={() => openDetailModal()}>{host.name}</HostName>
            </FlexRowBox>
          </NameCell>
          <StatusCell>
            <HostStateTag state={host.connectionState} />
          </StatusCell>
          <AgentVersionCell>
            <HostVesrsionBadge version={host.agentVersion} />
          </AgentVersionCell>
          <PlatformCell>
            <HostPlatformBox>
              <PlatformIcon platform={host.platform} />
            </HostPlatformBox>
          </PlatformCell>
          <InfoCell>
            <FlexSpaceBetweenBox>
              <DeviceCountBox onClick={() => openDetailModal()}>
                <MobileOutlined style={{ color: '#000' }} />
                &nbsp;{host.devices?.length}
              </DeviceCountBox>
              <MenuButton menu={{ items: isUsing ? stopUsageItems : pendingUsageItems }} />
            </FlexSpaceBetweenBox>
          </InfoCell>
        </ItemInner>
      </Item>

      <HostDetailModal isOpen={isDetailOpen} host={host} close={closeDetailModal} />
      <EditHostModal host={host} isOpen={isEditModalOpen} close={closeEditModal} />
    </>
  );
};

const HostListController = () => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const { keyword } = useHostFilterStore((state) => state.filterValue);
  const { data, error, mutate, page, updatePage, isLoading } = usePaginationSWR<HostBase>(
    organizationId ? `organizations/${organizationId}/hosts?keyword=${keyword}` : null,
    {
      skipQuestionMark: true,
    },
    { refreshInterval: 5000 },
  );
  const { t } = useTranslation();

  useRefresh(['onHostCreated', 'onRefreshClicked', 'onHostUpdated', 'onHostDeleted', 'onHostDeviceStopped', 'onHostDeviceUsed'], mutate);

  return (
    <>
      <Header>
        <ItemInner>
          <NameCell>{t('device-farm:hostTableNameColumn')}</NameCell>
          <StatusCell>{t('device-farm:hostTableConnectionStatusColumn')}</StatusCell>
          <AgentVersionCell>{t('device-farm:hostTableAgentVersion')}</AgentVersionCell>
          <PlatformCell>{t('device-farm:hostTableOSColumn')}</PlatformCell>
          <InfoCell>{t('device-farm:hostTableDevciesColumn')}</InfoCell>
        </ItemInner>
      </Header>
      <List<HostBase>
        dataSource={data?.items}
        renderItem={(item) => {
          return <HostItem host={item} />;
        }}
        loading={isLoading}
        rowKey={(item) => `host-${item.hostId}`}
        pagination={{
          defaultCurrent: 1,
          current: page,
          pageSize: 10,
          total: data?.totalCount,
          onChange: (p) => {
            scrollTo(0, 0);
            updatePage(p);
          },
        }}
        locale={{
          emptyText: (
            <ListEmpty
              style={{ whiteSpace: 'pre-wrap' }}
              image={<DesktopOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="device-farm:hostEmptyDescription"
                  components={[
                    <Link
                      href="https://docs.dogutech.io/management/organization/device-farm/host-management"
                      target="_blank"
                      key={'docs-link'}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />,
                    <br />,
                  ]}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default HostListController;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const ItemInner = styled.div`
  width: 100%;
  ${flexRowBaseStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const Cell = styled.div`
  ${tableCellStyle}
`;

const NameCell = styled(Cell)`
  flex: 3.5;
`;

const StatusCell = styled(Cell)`
  flex: 2.5;
`;

const AgentVersionCell = styled(Cell)`
  flex: 1.5;
`;

const PlatformCell = styled(Cell)`
  flex: 2.5;
`;

const InfoCell = styled(Cell)`
  flex: 1.5;
  margin-right: 0;
`;

const HostName = styled.span`
  ${listActiveNameStyle}
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const HostPlatformBox = styled(FlexRowBox)`
  justify-content: flex-start;
  margin-right: 0.5rem;
  font-size: 0.85rem;
`;

const DeviceCountBox = styled(FlexRowBox)`
  justify-content: flex-start;
  margin-right: 0.5rem;
  font-size: 0.85rem;
  ${listActiveNameStyle}
  font-weight: 400;
`;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const StyledDeleteModalContent = styled.p`
  line-height: 1.4;

  b {
    font-weight: 500;
  }
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
