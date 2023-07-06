import { useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { DeviceBase } from '@dogu-private/console';
import { DeviceConnectionState, OrganizationId, ProjectId } from '@dogu-private/types';
import { List, MenuProps } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';
import { MobileOutlined } from '@ant-design/icons';
import Trans from 'next-translate/Trans';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import { removeDeviceFromProject } from '../../api/device';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { getErrorMessage } from '../../utils/error';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import DeviceConnectionStateTag from '../device/DeviceConnectionStateTag';
import useEventStore from '../../stores/events';
import DeviceName from '../device/DeviceName';
import useModal from '../../hooks/useModal';
import DeviceDetailModal from '../device/DeviceDetailModal';
import DeviceTagAndProject from '../device/DeviceTagAndProject';
import { menuItemButtonStyles } from '../../styles/button';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from '../device/PlatformIcon';

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

  const streamingable = device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
  const isGlobalDevice = device.isGlobal === 1;

  const handleDelete = async () => {
    try {
      await removeDeviceFromProject(orgId, device.deviceId, projectId);
      sendSuccessNotification(t('device:deleteDeviceFromProjectSuccessMsg'));
      fireEvent('onProjectDeviceDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device:deleteDeviceFromProjectFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <PrimaryLinkButton
          href={`/dashboard/${router.query.orgId}/devices/streaming/${device.deviceId}`}
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
          {t('device:deviceItemStreamingMenu')}
        </PrimaryLinkButton>
      ),
      key: 'streaming',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDelete}
          disabled={device.isGlobal === 1}
          modalTitle={t('device:deleteDeviceFromProjectModalTitle')}
          modalButtonTitle={t('device:deleteDeviceFromProjectModalButtonText')}
          modalContent={t('device:deleteDeviceFromProjectModalContentText', { name: device.name })}
        >
          {t('device:deviceItemDeleteFromProjectMenu')}
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
            <DeviceConnectionStateTag connectionState={device.connectionState} />
          </OneSpanCell>
          <PlatformCell>
            <FlexRowBase style={{ marginBottom: '.4rem' }}>
              <PlatformIcon platform={device.platform} />
              {device.version}
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

  useRefresh(['onRefreshClicked', 'onProjectDeviceDeleted'], mutate);

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('device:deviceTableNameColumn')}</NameCell>
          <OneSpanCell>{t('device:deviceTableConnectionStatusColumn')}</OneSpanCell>
          <OneSpanCell>{t('device:deviceTableRunningStatusColumn')}</OneSpanCell>
          <PlatformCell>{t('device:deviceTablePlatformAndModalColumn')}</PlatformCell>
          <OneSpanCell>{t('device:deviceTableTagsAndProjectsColumn')}</OneSpanCell>
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
                  i18nKey="device:projectEmptyDescription"
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
