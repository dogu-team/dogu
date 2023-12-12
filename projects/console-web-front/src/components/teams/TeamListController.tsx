import { TeamBase, UserBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Avatar, List, MenuProps, Tooltip } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';
import Trans from 'next-translate/Trans';
import { TeamOutlined } from '@ant-design/icons';

import usePaginationSWR from 'src/hooks/usePaginationSWR';
import useRefresh from 'src/hooks/useRefresh';
import useTeamFilterStore from 'src/stores/team-filter';
import ProfileImage from '../ProfileImage';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import MenuButton from '../buttons/MenuButton';
import { menuItemButtonStyles } from '../../styles/button';
import ListEmpty from '../common/boxes/ListEmpty';
import { DoguDocsUrl } from '../../utils/url';

interface TeamItemProps {
  team: TeamBase;
}

const TeamItem = ({ team }: TeamItemProps) => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      label: (
        <StyledMenuLink href={`/dashboard/${router.query.orgId}/teams/${team.teamId}/members`}>
          {t('team:teamItemMemberMenu')}
        </StyledMenuLink>
      ),
      key: 'detail',
    },
    {
      label: (
        <StyledMenuLink href={`/dashboard/${router.query.orgId}/teams/${team.teamId}/projects`}>
          {t('team:teamItemProjectMenu')}
        </StyledMenuLink>
      ),
      key: 'detail',
    },
    {
      label: (
        <StyledMenuLink href={`/dashboard/${router.query.orgId}/teams/${team.teamId}/settings`}>
          {t('team:teamItemSettingMenu')}
        </StyledMenuLink>
      ),
      key: 'detail',
    },
  ];

  return (
    <Item>
      <ItemInner>
        <NameCell>
          <StyledLink href={`/dashboard/${organizationId}/teams/${team.teamId}/members`}>
            <TeamName>{team.name}</TeamName>
          </StyledLink>
        </NameCell>
        <MemberCell>
          <FlexBox>
            <Avatar.Group>
              {team.users?.map((item: UserBase) => (
                <Tooltip title={item.name} key={`team-${team.teamId}-user-${item.userId}`}>
                  <ProfileImage profileImageUrl={item.profileImageUrl} name={item.name} size={32} />
                </Tooltip>
              ))}
              {!!team.users?.length && team.users?.length > 3 && (
                <Avatar size={32} style={{ backgroundColor: '#40a9ff', fontSize: '0.9rem' }}>
                  +{team.users?.length - 3}
                </Avatar>
              )}
            </Avatar.Group>
          </FlexBox>
        </MemberCell>
        <MenuCell>
          <FlexEndBox>
            <MenuButton menu={{ items }} />
          </FlexEndBox>
        </MenuCell>
      </ItemInner>
    </Item>
  );
};

const TeamListController = () => {
  const router = useRouter();
  const organizationId = router.query.orgId;
  const { keyword } = useTeamFilterStore((state) => state.filterValue);
  const { data, page, updatePage, error, mutate, isLoading } = usePaginationSWR<TeamBase>(
    !!organizationId ? `/organizations/${organizationId}/teams?keyword=${keyword}` : null,
    {
      skipQuestionMark: true,
    },
  );
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onTeamCreated', 'onTeamUpdated', 'onTeamDeleted', 'onTeamMemberAdded'], () =>
    mutate(),
  );

  return (
    <>
      <Header>
        <ItemInner>
          <NameCell>{t('team:teamTableNameColumn')}</NameCell>
          <MemberCell>{t('team:teamTableMembersColumn')}</MemberCell>
          <MenuCell></MenuCell>
        </ItemInner>
      </Header>
      <List<TeamBase>
        dataSource={data?.items}
        loading={isLoading}
        renderItem={(item) => {
          return <TeamItem team={item} />;
        }}
        rowKey={(item) => `team-${item.teamId}`}
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
              image={<TeamOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="team:teamEmptyDescription"
                  components={{
                    br: <br />,
                    link: <Link href={DoguDocsUrl.management.organization.team()} target="_blank" />,
                  }}
                />
              }
            />
          ),
        }}
      />
    </>
  );
};

export default TeamListController;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const NameCell = styled.div`
  ${tableCellStyle}
  flex: 4;
`;

const MemberCell = styled.div`
  ${tableCellStyle}
  flex: 5;
`;

const MenuCell = styled.div`
  ${tableCellStyle}
  margin-right: 0;
  flex: 1;
`;

const TeamName = styled.p`
  ${listActiveNameStyle}
`;

const FlexBox = styled.div`
  ${flexRowBaseStyle}
`;

const FlexEndBox = styled(FlexBox)`
  justify-content: flex-end;
`;

const StyledLink = styled(Link)`
  display: inline-block;

  &:hover ${TeamName} {
    text-decoration: underline;
  }
`;

const StyledMenuLink = styled(Link)`
  ${menuItemButtonStyles}
  display: block;
  color: #000;

  &:hover {
    background-color: ${(props) => props.theme.colors.gray2} !important;
  }
`;
