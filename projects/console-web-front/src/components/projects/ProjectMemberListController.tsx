import { ProjectBase, PageBase, MemberAndRoleGroupBase, instanceOfTeamAndRoleGroupBase, instanceOfUserAndRoleGroupBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, ProjectRoleId } from '@dogu-private/types';
import { List, MenuProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import { useCallback } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { KeyedMutator } from 'swr';
import { TeamOutlined } from '@ant-design/icons';

import { removeTeamFromProject, removeUserFromProject, updateTeamInProject, updateUserInProject } from 'src/api/project';
import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import useAuthStore from 'src/stores/auth';
import useProjectMemberFilterStore from 'src/stores/project-member-filter';
import { getErrorMessage } from 'src/utils/error';
import PermissionSelector from '../PermissionSelector';
import ProfileImageWithName from '../users/ProfileImageWithName';
import ProfileImage from '../ProfileImage';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';
import Trans from 'next-translate/Trans';

interface MemberItemProps {
  item: MemberAndRoleGroupBase;
  projectId: ProjectId;
  mutateMembers: KeyedMutator<PageBase<MemberAndRoleGroupBase>>;
}

const MemberItem = ({ item, projectId, mutateMembers }: MemberItemProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();

  const handleSelectRole = useCallback(
    async (selectedRole: ProjectRoleId, onError: () => void) => {
      try {
        if (instanceOfTeamAndRoleGroupBase(item)) {
          await updateTeamInProject(orgId, projectId, item.teamId, { projectRoleId: selectedRole });
        } else {
          await updateUserInProject(orgId, projectId, item.userId, { projectRoleId: selectedRole });
        }

        sendSuccessNotification(t('project-member:updateMemberPermissionSuccessMsg'));
        mutateMembers();
      } catch (e) {
        if (e instanceof AxiosError) {
          sendErrorNotification(t('project-member:updateMemberPermissionFailureMsg', { reason: getErrorMessage(e) }));
        }
        onError();
      }
    },
    [orgId, item, projectId, mutateMembers],
  );

  const handleRemoveMember = async () => {
    try {
      if (instanceOfUserAndRoleGroupBase(item)) {
        await removeUserFromProject(orgId, projectId, item.userId);
      } else {
        await removeTeamFromProject(orgId, projectId, item.teamId);
      }
      mutateMembers();
      sendSuccessNotification(t('project-member:removeMemberSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-member:removeMemberFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleRemoveMember}
          modalTitle={t('project-member:removeMemberModalTitle')}
          modalButtonTitle={t('project-member:removeMemberModalButtonText')}
          modalContent={t('project-member:removeMemberModalContent')}
        >
          {t('project-member:memberItemDeleteMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  return (
    <Item>
      <FlexBaseBox>
        <NameCell>
          {/* TODO */}
          {instanceOfTeamAndRoleGroupBase(item) ? (
            <StyledTeamLink href={`/dashboard/${orgId}/teams/${item.teamId}/members`}>{item.team?.name}</StyledTeamLink>
          ) : (
            <ProfileImageWithName profileImage={<ProfileImage size={32} name={item.user?.name} profileImageUrl={item.user?.profileImageUrl} />} name={item.user?.name} />
          )}
        </NameCell>
        {/* TODO */}
        <OneSpanCell>{instanceOfTeamAndRoleGroupBase(item) ? t('project-member:teamMemberType') : t('project-member:colleagueMemberType')}</OneSpanCell>
        <PermissionCell>
          <PermissionSelector defaultRoleId={item.projectRole?.projectRoleId} organizationId={orgId} onSelectRole={handleSelectRole} />
        </PermissionCell>
        <MenuCell>
          <FlexEndBox>
            <MenuButton menu={{ items }} />
          </FlexEndBox>
        </MenuCell>
      </FlexBaseBox>
    </Item>
  );
};

interface Props {
  project: ProjectBase;
}

const ProjectMemberListController = ({ project }: Props) => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const { keyword } = useProjectMemberFilterStore((state) => state.filterValue);
  const {
    data: memberData,
    error: memberError,
    mutate: mutateMember,
    page,
    updatePage,
    isLoading,
  } = usePaginationSWR<MemberAndRoleGroupBase>(`/organizations/${organizationId}/projects/${project.projectId}/members?keyword=${keyword}`, { skipQuestionMark: true });
  const { me } = useAuthStore();
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onProjectMemberAdded'], mutateMember);

  return (
    <>
      <Header>
        <FlexBaseBox>
          <NameCell>{t('project-member:projectMemberTableProfileColumn')}</NameCell>
          <OneSpanCell>{t('project-member:projectMemberTableTypeColumn')}</OneSpanCell>
          <PermissionCell>{t('project-member:projectMemberTablePermissionColum')}</PermissionCell>
          <MenuCell></MenuCell>
        </FlexBaseBox>
      </Header>
      <List<MemberAndRoleGroupBase>
        loading={isLoading}
        dataSource={memberData?.items}
        pagination={{
          defaultCurrent: 1,
          pageSize: 10,
          current: page,
          total: project.members?.length ?? 0,
          onChange: (p) => updatePage(p),
        }}
        renderItem={(item) => <MemberItem item={item} mutateMembers={mutateMember} projectId={project.projectId} />}
        rowKey={(record) => {
          if (instanceOfTeamAndRoleGroupBase(record)) {
            return `project-${project.projectId}-member-${record.team?.name}`;
          } else {
            return `project-${project.projectId}-member-${record.user?.name}`;
          }
        }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<TeamOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="project-member:projectMemberEmptyDescription"
                  components={{ br: <br />, link: <Link href="https://docs.dogutech.io/organization-and-project/project/member" target="_blank" /> }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default ProjectMemberListController;

const StyledTeamLink = styled(Link)`
  display: flex;
  color: ${(props) => props.theme.colors.primary};
  text-decoration: underline;
  align-items: center;
  padding: 16px;
  height: 100%;
`;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const FlexBaseBox = styled.div`
  ${flexRowBaseStyle}
`;

const NameCell = styled.div`
  ${tableCellStyle}
  flex: 3;
`;

const OneSpanCell = styled.div`
  ${tableCellStyle}
  flex: 1;
`;

const PermissionCell = styled.div`
  ${tableCellStyle}
  flex: 2;
`;

const MenuCell = styled(OneSpanCell)`
  margin-right: 0;
`;

const FlexEndBox = styled(FlexBaseBox)`
  justify-content: flex-end;
`;
