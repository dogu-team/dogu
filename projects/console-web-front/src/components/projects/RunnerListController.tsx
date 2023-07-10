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
import RunnerConnectionStateTag from '../runner/RunnerConnectionStateTag';
import useEventStore from '../../stores/events';
import RunnerName from '../runner/RunnerName';
import useModal from '../../hooks/useModal';
import RunnerDetailModal from '../runner/RunnerDetailModal';
import RunnerTagAndProject from '../runner/RunnerTagAndProject';
import { menuItemButtonStyles } from '../../styles/button';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import PlatformIcon from '../runner/PlatformIcon';

interface RunnerItemProps {
  runner: DeviceBase;
  projectId: ProjectId;
}

const RunnerItem = ({ runner, projectId }: RunnerItemProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [isDetailModalOpen, openDetailModal, closeDetailModal] = useModal();
  const { t } = useTranslation();

  const streamingable = runner.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
  const isGlobalDevice = runner.isGlobal === 1;

  const handleDelete = async () => {
    try {
      await removeDeviceFromProject(orgId, runner.deviceId, projectId);
      sendSuccessNotification(t('runner:deleteRunnerFromProjectSuccessMsg'));
      fireEvent('onProjectDeviceDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('runner:deleteRunnerFromProjectFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <PrimaryLinkButton
          href={`/dashboard/${router.query.orgId}/devices/streaming/${runner.deviceId}`}
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
          disabled={runner.isGlobal === 1}
          modalTitle={t('runner:deleteRunnerFromProjectModalTitle')}
          modalButtonTitle={t('runner:deleteRunnerFromProjectModalButtonText')}
          modalContent={t('runner:deleteRunnerFromProjectModalContentText', { name: runner.name })}
        >
          {t('runner:runnerItemDeleteFromProjectMenu')}
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
            <RunnerName runner={runner} onClick={handleClickDetail} />
          </NameCell>
          <OneSpanCell>
            <RunnerConnectionStateTag connectionState={runner.connectionState} />
          </OneSpanCell>
          <OneSpanCell>
            <RunnerConnectionStateTag connectionState={runner.connectionState} />
          </OneSpanCell>
          <PlatformCell>
            <FlexRowBase style={{ marginBottom: '.4rem' }}>
              <PlatformIcon platform={runner.platform} />
              {runner.version}
            </FlexRowBase>
            <div>
              {runner.modelName} {`(${runner.model})`}
            </div>
          </PlatformCell>
          <OneSpanCell>
            <RunnerTagAndProject
              tagCount={runner.deviceTags?.length}
              projectCount={isGlobalDevice ? undefined : runner.projects?.length}
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

      <RunnerDetailModal isOpen={isDetailModalOpen} runner={runner} close={closeDetailModal} />
    </>
  );
};

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const RunnerListController = ({ organizationId, projectId }: Props) => {
  const { data, isLoading, error, mutate, updatePage, page } = usePaginationSWR<DeviceBase>(`/organizations/${organizationId}/projects/${projectId}/devices`, undefined, {
    keepPreviousData: true,
  });
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onProjectDeviceDeleted'], mutate);

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('runner:runnerTableNameColumn')}</NameCell>
          <OneSpanCell>{t('runner:runnerTableConnectionStatusColumn')}</OneSpanCell>
          <OneSpanCell>{t('runner:runnerTableRunningStatusColumn')}</OneSpanCell>
          <PlatformCell>{t('runner:runnerTablePlatformAndModalColumn')}</PlatformCell>
          <OneSpanCell>{t('runner:runnerTableTagsAndProjectsColumn')}</OneSpanCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<DeviceBase>
        dataSource={data?.items}
        loading={isLoading}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        renderItem={(item) => <RunnerItem runner={item} projectId={projectId} />}
        rowKey={(item) => `project-${projectId}-device-${item.deviceId}`}
        locale={{
          emptyText: (
            <ListEmpty
              image={<MobileOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="runner:projectEmptyDescription"
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

export default RunnerListController;

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
