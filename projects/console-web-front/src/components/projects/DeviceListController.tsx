import { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { DeviceBase } from '@dogu-private/console';
import { DeviceConnectionState, OrganizationId, ProjectId } from '@dogu-private/types';
import { List, MenuProps, Tooltip } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';
import { ExclamationCircleOutlined, MobileOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';
import { PiMonitorPlayBold } from 'react-icons/pi';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import { removeDeviceFromProject } from '../../api/device';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { getErrorMessageFromAxios } from '../../utils/error';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import DeviceConnectionStateTag from '../device/DeviceConnectionStateTag';
import useEventStore from '../../stores/events';
import DeviceName from '../device/DeviceName';
import useModal from '../../hooks/useModal';
import DeviceDetailModal from '../device/DeviceDetailModal';
import DeviceTagAndProject from '../device/DeviceTagAndProject';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from '../device/PlatformIcon';
import DeviceVersionAlertIcon from '../device/DeviceVersionAlertIcon';
import DeviceUsageStatusBadge from '../device/DeviceUsageStatusBadge';

interface DeviceItemProps {
  device: DeviceBase;
  projectId: ProjectId;
}

const DeviceItem = ({ device, projectId }: DeviceItemProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [isDetailModalOpen, openDetailModal, closeDetailModal] = useModal();
  const { t } = useTranslation();

  const isConnected = device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
  const isGlobalDevice = device.isGlobal === 1;
  const studioDisabled = !isConnected || device.displayError !== null;

  const handleDelete = async () => {
    try {
      await removeDeviceFromProject(orgId, device.deviceId, projectId);
      sendSuccessNotification(t('device-farm:deleteDeviceFromProjectSuccessMsg'));
      fireEvent('onProjectDeviceDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:deleteDeviceFromProjectFailureMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDelete}
          disabled={device.isGlobal === 1}
          modalTitle={t('device-farm:deleteDeviceFromProjectModalTitle')}
          modalButtonTitle={t('device-farm:deleteDeviceFromProjectModalButtonText')}
          modalContent={t('device-farm:deleteDeviceFromProjectModalContentText', { name: device.name })}
        >
          {t('device-farm:deviceItemDeleteFromProjectMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  const handleClickDetail = useCallback(() => openDetailModal(), []);

  return (
    <>
      <Item>
        <FlexRowBase>
          <NameCell>
            <DeviceName device={device} onClick={handleClickDetail} />
          </NameCell>
          <OneSpanCell>
            <DeviceConnectionStateTag connectionState={device.connectionState} />
          </OneSpanCell>
          <OneSpanCell>
            <DeviceUsageStatusBadge device={device} />
          </OneSpanCell>
          <PlatformCell>
            <FlexRowBase style={{ marginBottom: '.4rem' }}>
              <PlatformIcon platform={device.platform} />
              &nbsp;
              {device.version}
              &nbsp;
              <DeviceVersionAlertIcon device={device} />
            </FlexRowBase>
            <div>
              {device.modelName} {`(${device.model})`}
            </div>
          </PlatformCell>
          <OneSpanCell>
            <DeviceTagAndProject
              tagCount={device.deviceTags?.length}
              projectCount={isGlobalDevice ? undefined : device.projects?.length}
              onTagClick={handleClickDetail}
              onProjectClick={handleClickDetail}
            />
          </OneSpanCell>
          <OneSpanCell style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={device.displayError} open={isConnected && device.displayError ? undefined : false}>
              <StudioLinkButton
                href={`/dashboard/${orgId}/projects/${projectId}/studio/${device.deviceId}/manual`}
                target="_blank"
                disabled={studioDisabled}
                onClick={(e) => {
                  if (studioDisabled) {
                    e.preventDefault();
                  }
                }}
                onAuxClick={(e) => {
                  if (studioDisabled) {
                    e.preventDefault();
                  }
                }}
                onContextMenu={(e) => {
                  if (studioDisabled) {
                    e.preventDefault();
                  }
                }}
              >
                {isConnected && device.displayError ? (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '.25rem' }} />
                ) : (
                  <PiMonitorPlayBold style={{ marginRight: '.25rem' }} />
                )}
                Studio
              </StudioLinkButton>
            </Tooltip>
          </OneSpanCell>
          <MenuCell>
            <FlexEndBox>
              <MenuButton menu={{ items }} />
            </FlexEndBox>
          </MenuCell>
        </FlexRowBase>
      </Item>

      <DeviceDetailModal isOpen={isDetailModalOpen} device={device} close={closeDetailModal} />
    </>
  );
};

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const DeviceListController = ({ organizationId, projectId }: Props) => {
  const { data, isLoading, error, mutate, updatePage, page } = usePaginationSWR<DeviceBase>(`/organizations/${organizationId}/projects/${projectId}/devices`, undefined, {
    keepPreviousData: true,
  });
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onProjectDeviceDeleted'], () => mutate());

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('device-farm:deviceTableNameColumn')}</NameCell>
          <OneSpanCell>{t('device-farm:deviceTableConnectionStatusColumn')}</OneSpanCell>
          <OneSpanCell>{t('device-farm:deviceTableRunningStatusColumn')}</OneSpanCell>
          <PlatformCell>{t('device-farm:deviceTablePlatformAndModalColumn')}</PlatformCell>
          <OneSpanCell>{t('device-farm:deviceTableTagsAndProjectsColumn')}</OneSpanCell>
          <OneSpanCell></OneSpanCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<DeviceBase>
        dataSource={data?.items}
        loading={isLoading}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        renderItem={(item) => <DeviceItem device={item} projectId={projectId} />}
        rowKey={(item) => `project-${projectId}-device-${item.deviceId}`}
        locale={{
          emptyText: (
            <ListEmpty
              image={<MobileOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="device-farm:projectEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/management/project/device" target="_blank" /> }}
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

const FlexRowBase = styled.div`
  ${flexRowBaseStyle}
`;

const NameCell = styled.div`
  ${tableCellStyle}
  flex: 3;
`;

const PlatformCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const OneSpanCell = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const MenuCell = styled(OneSpanCell)`
  margin-right: 0;
`;

const FlexEndBox = styled(FlexRowBase)`
  justify-content: flex-end;
`;

const StudioLinkButton = styled(Link)<{ disabled: boolean }>`
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: ${(props) => (props.disabled ? props.theme.main.colors.gray5 : props.theme.colorPrimary)};
  color: #fff !important;
  text-align: center;
  align-items: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    color: #fff;
    background-color: ${(props) => (props.disabled ? props.theme.main.colors.gray5 : `${props.theme.colorPrimary}bb`)};
  }
`;
