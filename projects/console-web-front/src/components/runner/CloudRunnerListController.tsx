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
import RunnerConnectionStateTag from './RunnerConnectionStateTag';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import EditRunnerProjectModal from './EditRunnerProjectModal';
import useModal from '../../hooks/useModal';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import EditRunnerModal from './EditRunnerModal';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from './PlatformIcon';
import RunnerPrefixTag from './RunnerPrefixTag';
import useEventStore from '../../stores/events';

interface DeviceItemProps {
  device: DeviceBase;
}

const RunnerItem = ({ device }: DeviceItemProps) => {
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
          {t('runner:runnerItemStartUseMenu')}
        </MenuItemButton>
      ),
      key: 'add',
    },
    { type: 'divider' },
    {
      label: (
        <MenuItemButton danger={false} onClick={() => openEditModal()}>
          {t('runner:runnerItemEditMenu')}
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
            <RunnerPrefixTag runner={device} />
            {device.name}
          </NameCell>
          <ConnectionStatusCell>
            <RunnerConnectionStateTag connectionState={device.connectionState} />
          </ConnectionStatusCell>
          <PlatformCell>
            <FlexRowBase style={{ marginBottom: '.4rem' }}>
              <PlatformIcon platform={device.platform} />
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

      <EditRunnerProjectModal runnerId={device.deviceId} isOpen={isAddProjectModalOpen} close={closeAddProjectModal} isGlobal={false} />
      <EditRunnerModal runner={device} isOpen={isEditModalOpen} close={closeEditModal} />
    </>
  );
};

const CloudRunnerListController = () => {
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

  useRefresh(['onRefreshClicked', 'onAddDeviceToProjectModalClosed', 'onDeviceUpdated'], mutate);

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>Brand</NameCell>
          <ConnectionStatusCell>Model</ConnectionStatusCell>
          <PlatformCell>Platform & Version</PlatformCell>
          <HostCell>Status</HostCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<DeviceBase>
        dataSource={data?.items}
        renderItem={(item) => <RunnerItem device={item} />}
        loading={isLoading}
        rowKey={(item) => `addable-device-${item.deviceId}`}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        locale={{
          emptyText: (
            <ListEmpty
              description={
                <div>
                  <p>{t('runner:addableRunnerEmptyDescription')}</p>
                  <br />
                  <EmptyDescriptionManualBox>
                    <EmptyDescriptionManualTitle>{t('runner:addableRunnerEmptyManualTitle')}</EmptyDescriptionManualTitle>
                    <EmptyDescriptionList>
                      <EmptyDescriptionListItem>{t('runner:addableRunnerEmptyManual1')}</EmptyDescriptionListItem>
                      <EmptyDescriptionListItem>{t('runner:addableRunnerEmptyManual2')}</EmptyDescriptionListItem>
                      <EmptyDescriptionListItem>{t('runner:addableRunnerEmptyManual3')}</EmptyDescriptionListItem>
                    </EmptyDescriptionList>
                    <Trans
                      i18nKey="runner:addableRunnerEmptyLink"
                      components={{ link: <Link href={'https://docs.dogutech.io/management/organization/device/device-management'} target="_blank" /> }}
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

export default CloudRunnerListController;

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
