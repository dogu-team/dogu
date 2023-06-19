import { OrganizationId, ProjectRoleId, TeamId } from '@dogu-private/types';
import { List, MenuProps } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useCallback } from 'react';
import styled from 'styled-components';
import { AppstoreOutlined } from '@ant-design/icons';

import { removeTeamFromProject, updateTeamInProject } from 'src/api/project';
import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import useTeamProjectFilterStore from 'src/stores/team-project-filter';
import { getErrorMessage } from 'src/utils/error';
import PermissionSelector from '../PermissionSelector';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { useRouter } from 'next/router';
import useEventStore from '../../stores/events';
import MenuItemButton from '../buttons/MenuItemButton';
import MenuButton from '../buttons/MenuButton';
import { listActiveNameStyle } from '../../styles/text';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import { ProjectAndTeamAndProjectRoleBase } from '@dogu-private/console';

interface ProjectItemProps {
  item: ProjectAndTeamAndProjectRoleBase;
}

const ProjectItem = ({ item }: ProjectItemProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleUpdatePermission = useCallback(
    async (selectedRole: ProjectRoleId, onError: () => void) => {
      try {
        await updateTeamInProject(orgId, item.projectId, item.teamId, { projectRoleId: selectedRole });
        sendSuccessNotification(t('team:projectPermissionUpdateSuccessMsg'));
        fireEvent('onTeamProjectPermissionUpdated');
      } catch (e) {
        if (e instanceof AxiosError) {
          sendErrorNotification(t('team:projectPermissionUpdateFailMsg', { reason: getErrorMessage(e) }));
        }
        onError();
      }
    },
    [orgId, item.teamId, item.projectId],
  );

  const handleClickDelete = useCallback(async () => {
    try {
      await removeTeamFromProject(orgId, item.projectId, item.teamId);
      sendSuccessNotification(t('team:projectRemoveSuccessMsg'));
      fireEvent('onTeamProjectDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('team:projectRemoveFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  }, [orgId, item.teamId, item.projectId]);

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleClickDelete}
          modalTitle={t('team:removeProjectModalTitle')}
          modalButtonTitle={t('team:removeProjectModalButtonText')}
          modalContent={t('team:removeProjectModalContentText', { name: item.project?.name })}
        >
          {t('team:projectItemRemoveMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  return (
    <Item>
      <FlexRowBase>
        <NameCell>
          <StyledLink href={`/dashboard/${orgId}/projects/${item.projectId}`}>
            <ProjectName>{item.project?.name}</ProjectName>
          </StyledLink>
        </NameCell>
        <PermissionCell>
          <PermissionSelector defaultRoleId={item.projectRoleId} organizationId={orgId} onSelectRole={async (roleId, onError) => await handleUpdatePermission(roleId, onError)} />
        </PermissionCell>
        <MenuCell>
          <FlexEndBox>
            <MenuButton menu={{ items }} />
          </FlexEndBox>
        </MenuCell>
      </FlexRowBase>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
  teamId: TeamId;
}

const ProjectListController = ({ teamId, organizationId }: Props) => {
  const { keyword } = useTeamProjectFilterStore((state) => state.filterValue);
  const { data, page, updatePage, error, mutate } = usePaginationSWR<ProjectAndTeamAndProjectRoleBase>(
    `/organizations/${organizationId}/teams/${teamId}/projects?keyword=${keyword}`,
    {
      skipQuestionMark: true,
    },
  );
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onTeamProjectAdded', 'onTeamProjectPermissionUpdated', 'onTeamProjectDeleted'], mutate);

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('team:projectTableNameColumn')}</NameCell>
          <PermissionCell>{t('team:projectTablePermissionColumn')}</PermissionCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<ProjectAndTeamAndProjectRoleBase>
        loading={!data && !error}
        rowKey={(record) => `team-project-${record.projectId}`}
        dataSource={data?.items}
        renderItem={(item) => <ProjectItem item={item} />}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        locale={{
          emptyText: <ListEmpty image={<AppstoreOutlined style={{ fontSize: '80px' }} />} description={t('team:teamProjectEmptyDescription')} />,
        }}
      />
    </>
  );
};

export default ProjectListController;

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

const PermissionCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const MenuCell = styled.div`
  ${tableCellStyle}
  flex: 1;
  margin-right: 0;
`;

const ProjectName = styled.p`
  ${listActiveNameStyle}
`;

const StyledLink = styled(Link)`
  display: inline-block;

  &:hover ${ProjectName} {
    text-decoration: underline;
  }
`;

const FlexEndBox = styled(FlexRowBase)`
  justify-content: flex-end;
`;
