import { DeviceBase } from '@dogu-private/console';
import { List, MenuProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Trans from 'next-translate/Trans';
import Link from 'next/link';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import useUnallowedDeviceFilterStore from 'src/stores/unallowed-device-filter';
import DeviceConnectionStateTag from './DeviceConnectionStateTag';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import AddDeviceToProjectModal from './EditDeviceProjectModal';
import useModal from '../../hooks/useModal';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import DeviceSettingModal from './DeviceSettingModal';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from './PlatformIcon';
import DevicePrefixTag from './DevicePrefixTag';
import useEventStore from '../../stores/events';

interface DeviceItemProps {
  device: DeviceBase;
}

const DeviceItem = ({ device }: DeviceItemProps) => {
  const [isAddProjectModalOpen, openAddProjectModal, closeAddProjectModal] = useModal();
  const [isEditModalOpen, openEditModal, closeEditModal] = useModal();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger={false}
          primary
          onClick={() => {
            fireEvent('onAddDeviceToProjectModalOpened');
            openAddProjectModal();
          }}
        >
          {t('device-farm:deviceItemStartUseMenu')}
        </MenuItemButton>
      ),
      key: 'add',
    },
    { type: 'divider' },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditModal()}>
          {t('device-farm:deviceItemSettingMenu')}
        </MenuItemButton>
      ),
      key: 'edit',
    },
  ];

  return (
    <>
      <Item>
        <FlexRowBase>
          <NameCell>
            <DevicePrefixTag device={device} />
            {device.name}
          </NameCell>
          <ConnectionStatusCell>
            <DeviceConnectionStateTag connectionState={device.connectionState} />
          </ConnectionStatusCell>
          <PlatformCell>
            <FlexRowBase style={{ marginBottom: '.4rem' }}>
              <PlatformIcon platform={device.platform} />
              &nbsp;
              {device.version}
            </FlexRowBase>
            <div>
              {device.modelName} {`(${device.model})`}
            </div>
          </PlatformCell>
          <HostCell>{device.host?.name}</HostCell>
          <MenuCell>
            <FlexRowEnd>
              <MenuButton menu={{ items }} />
            </FlexRowEnd>
          </MenuCell>
        </FlexRowBase>
      </Item>

      <AddDeviceToProjectModal
        deviceId={device.deviceId}
        isOpen={isAddProjectModalOpen}
        close={closeAddProjectModal}
        isGlobal={false}
      />
      <DeviceSettingModal device={device} isOpen={isEditModalOpen} close={closeEditModal} />
    </>
  );
};

const AddableDeviceListController = () => {
  const router = useRouter();
  const organizationId = router.query.orgId;
  const { name } = useUnallowedDeviceFilterStore((state) => state.filterValue);
  const { data, error, mutate, page, updatePage, isLoading } = usePaginationSWR<DeviceBase>(
    organizationId ? `/organizations/${organizationId}/devices/addable?deviceName=${name}` : null,
    {
      skipQuestionMark: true,
    },
  );
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onAddDeviceToProjectModalClosed', 'onDeviceUpdated'], () => mutate());

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('device-farm:deviceTableNameColumn')}</NameCell>
          <ConnectionStatusCell>{t('device-farm:deviceTableConnectionStatusColumn')}</ConnectionStatusCell>
          <PlatformCell>{t('device-farm:deviceTablePlatformAndModalColumn')}</PlatformCell>
          <HostCell>{t('device-farm:deviceTableHostColumn')}</HostCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<DeviceBase>
        dataSource={data?.items}
        renderItem={(item) => <DeviceItem device={item} />}
        loading={isLoading}
        rowKey={(item) => `addable-device-${item.deviceId}`}
        pagination={{
          defaultCurrent: 1,
          current: page,
          pageSize: 10,
          total: data?.totalCount,
          onChange: (page, pageSize) => updatePage(page),
        }}
        locale={{
          emptyText: (
            <ListEmpty
              description={
                <div>
                  <p>{t('device-farm:addableDeviceEmptyDescription')}</p>
                  <br />
                  <EmptyDescriptionManualBox>
                    <EmptyDescriptionManualTitle>
                      {t('device-farm:addableDeviceEmptyManualTitle')}
                    </EmptyDescriptionManualTitle>
                    <EmptyDescriptionList>
                      <EmptyDescriptionListItem>{t('device-farm:addableDeviceEmptyManual1')}</EmptyDescriptionListItem>
                      <EmptyDescriptionListItem>{t('device-farm:addableDeviceEmptyManual2')}</EmptyDescriptionListItem>
                      <EmptyDescriptionListItem>{t('device-farm:addableDeviceEmptyManual3')}</EmptyDescriptionListItem>
                    </EmptyDescriptionList>
                    <Trans
                      i18nKey="device-farm:addableDeviceEmptyLink"
                      components={{
                        tutorialLink: <Link href={`/dashboard/${router.query.orgId}/get-started`} />,
                        link: (
                          <Link
                            href={'https://docs.dogutech.io/management/organization/device-farm/device-management'}
                            target="_blank"
                          />
                        ),
                      }}
                    />
                  </EmptyDescriptionManualBox>
                  <p></p>
                </div>
              }
            />
          ),
        }}
      />
    </>
  );
};

export default AddableDeviceListController;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const FlexRowBase = styled.div`
  ${flexRowBaseStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const NameCell = styled.div`
  ${tableCellStyle}
  ${flexRowBaseStyle}
  flex: 3;
`;

const ConnectionStatusCell = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const PlatformCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const HostCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const MenuCell = styled.div`
  ${tableCellStyle}
  flex:1;
  margin-right: 0;
`;

const FlexRowEnd = styled.div`
  ${flexRowBaseStyle}
  justify-content: flex-end;
`;

const EmptyDescriptionManualBox = styled.div`
  max-width: 300px;
  width: 100%;
  margin: 0 auto;
`;

const EmptyDescriptionManualTitle = styled.p`
  text-align: left;
`;

const EmptyDescriptionList = styled.ol`
  padding-left: 1rem;
  margin: 0.25rem 0 1rem;
  text-align: left;
`;

const EmptyDescriptionListItem = styled.li`
  list-style-type: decimal;
`;
