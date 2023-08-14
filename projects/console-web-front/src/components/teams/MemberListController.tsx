import { UserBase } from '@dogu-private/console';
import { OrganizationId, TeamId } from '@dogu-private/types';
import { List, MenuProps } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { UserOutlined } from '@ant-design/icons';

import { removeUserFromTeam } from 'src/api/team';
import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import useTeamMemberFilterStore from 'src/stores/team-member-filter';
import { getErrorMessageFromAxios } from 'src/utils/error';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import Profile from '../Profile';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import ListEmpty from '../common/boxes/ListEmpty';

interface MemberProps {
  member: UserBase;
  teamId: TeamId;
}

const MemberItem = ({ member, teamId }: MemberProps) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleDelete = async () => {
    try {
      await removeUserFromTeam(orgId, teamId, member.userId);
      sendSuccessNotification(t('team:memberRemoveSuccessMsg'));
      fireEvent('onTeamMemberDeleted');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('team:memberRemoveFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          danger
          onConfirm={handleDelete}
          modalTitle={t('team:memberRemoveModalTitle')}
          modalButtonTitle={t('team:memberRemoveButtonText')}
          modalContent={t('team:memberRemoveContent')}
        >
          {t('team:memberItemRemoveMenu')}
        </MenuItemButton>
      ),
      key: 'delete',
    },
  ];

  return (
    <Item>
      <FlexRowBase>
        <NameCell>
          <Profile name={member.name} profileImageUrl={member.profileImageUrl} desc={member.email} />
        </NameCell>
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

const MemberListController = ({ organizationId, teamId }: Props) => {
  const { keyword } = useTeamMemberFilterStore((state) => state.filterValue);
  const { data, page, updatePage, error, mutate, isLoading } = usePaginationSWR<UserBase>(`/organizations/${organizationId}/teams/${teamId}/users?keyword=${keyword}`, {
    skipQuestionMark: true,
  });
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onTeamMemberAdded', 'onTeamMemberDeleted'], () => mutate());

  return (
    <>
      <Header>
        <FlexRowBase>
          <NameCell>{t('team:memberTableProfileColumn')}</NameCell>
          <MenuCell></MenuCell>
        </FlexRowBase>
      </Header>
      <List<UserBase>
        loading={isLoading}
        rowKey={(record) => `team-member-${record.userId}`}
        dataSource={data?.items}
        renderItem={(item) => <MemberItem member={item} teamId={teamId} />}
        pagination={{ defaultCurrent: 1, current: page, pageSize: 10, total: data?.totalCount, onChange: (page, pageSize) => updatePage(page) }}
        locale={{
          emptyText: <ListEmpty image={<UserOutlined style={{ fontSize: '90px' }} />} description={t('team:teamMemberEmptyDescription')} />,
        }}
      />
    </>
  );
};

export default MemberListController;

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
  flex: 4;
`;

const MenuCell = styled.div`
  ${tableCellStyle}
  flex: 1;
  margin-right: 0;
`;

const FlexEndBox = styled(FlexRowBase)`
  justify-content: flex-end;
`;
