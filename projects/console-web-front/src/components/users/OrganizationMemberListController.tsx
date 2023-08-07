import { UpdateOrganizationRoleDtoBase, UserBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { List, MenuProps, notification, Select } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import useAuthStore from 'src/stores/auth';
import useOrganizationMemberFilterStore from 'src/stores/organization-member-filter';
import { getErrorMessageFromAxios } from 'src/utils/error';
import { flexRowBaseStyle, listItemStyle, tableHeaderStyle } from '../../styles/box';
import Profile from '../Profile';
import useEventStore from '../../stores/events';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { updateUserOrgPermission, deleteOrganizationMember } from '../../api/organization';

interface MemberItemProps {
  member: UserBase;
}

const MemberItem = ({ member }: MemberItemProps) => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const { me } = useAuthStore();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const handleChangeAuthority = async (authority: number) => {
    try {
      const updateRoleDtoBase: UpdateOrganizationRoleDtoBase = { organizationRoleId: authority };
      await updateUserOrgPermission(organizationId, member.userId, updateRoleDtoBase);
      sendSuccessNotification(t('org-member:permissionUpdateSuccessMsg'));
      fireEvent('onOrgMemberUpdated');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('org-member:permissionUpdateFailureMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const handleClickDelete = async () => {
    try {
      await deleteOrganizationMember(organizationId, member.userId);
      sendSuccessNotification(t('org-member:removeMemberSuccessMsg'));
      fireEvent('onOrgMemberDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('org-member:removeMemberFailureMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          disabled={member.userId === me?.userId}
          onConfirm={handleClickDelete}
          modalTitle={t('org-member:removeModalTitle')}
          modalButtonTitle={t('org-member:removeModalButtonText')}
          modalContent={<p>{t('org-member:removeModalContentText')}</p>}
          confirmButtonId="remove-member-confirm-btn"
        >
          {t('org-member:memberItemRemoveMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
      style: { padding: '0' },
    },
  ];

  return (
    <Item>
      <ItemInner>
        <ProfileCell>
          <Profile name={member.name} desc={member.email} profileImageUrl={member.profileImageUrl} />
        </ProfileCell>
        <PermissionCell>
          {member.organizationAndUserAndOrganizationRoles?.[0].organizationRoleId === 1 ? (
            <div>Owner</div>
          ) : (
            <PermissionSelectBox>
              <Select
                style={{ width: '100%' }}
                disabled={me?.userId === member.userId}
                defaultValue={member.organizationAndUserAndOrganizationRoles?.[0].organizationRoleId}
                onChange={handleChangeAuthority}
              >
                {[2, 3].map((roleId) => (
                  <Select.Option key={`${roleId}`} value={roleId}>
                    {roleId === 2 && <div>Admin</div>}
                    {roleId === 3 && <div>Member</div>}
                  </Select.Option>
                ))}
              </Select>
            </PermissionSelectBox>
          )}
        </PermissionCell>
        <MenuCell>
          <MenuButton menu={{ items }} />
        </MenuCell>
      </ItemInner>
    </Item>
  );
};

const OrganizationMemberListController = () => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const { keyword } = useOrganizationMemberFilterStore((state) => state.filterValue);
  const { data, error, mutate, page, updatePage, isLoading } = usePaginationSWR<UserBase>(organizationId ? `/organizations/${organizationId}/users?keyword=${keyword}` : null, {
    skipQuestionMark: true,
  });
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onOrgMemberDeleted', 'onOrgMemberUpdated'], mutate);

  return (
    <>
      <Header>
        <ItemInner>
          <ProfileCell>{t('org-member:memberTableProfileColumn')}</ProfileCell>
          <PermissionCell>{t('org-member:memberTablePermissionColumn')}</PermissionCell>
          <MenuCell></MenuCell>
        </ItemInner>
      </Header>
      <List<UserBase>
        dataSource={data?.items}
        renderItem={(item) => {
          return <MemberItem member={item} />;
        }}
        loading={isLoading}
        rowKey={(item) => `org-user-${item.userId}`}
        pagination={{
          defaultCurrent: 1,
          current: page,
          onChange: (p) => {
            scrollTo(0, 0);
            updatePage(p);
          },
          pageSize: 10,
          total: data?.totalCount,
        }}
      />
    </>
  );
};

export default OrganizationMemberListController;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}

  & > *:last-child {
    margin-right: 0;
  }
`;

const Cell = styled.div`
  margin-right: 1rem;
`;

const ProfileCell = styled.div`
  flex: 6;
`;

const PermissionCell = styled.div`
  flex: 3;
`;

const MenuCell = styled.div`
  ${flexRowBaseStyle}
  flex: 1;
  justify-content: flex-end;
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const PermissionSelectBox = styled.div`
  max-width: 150px;
`;
