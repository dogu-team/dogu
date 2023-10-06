import { BankOutlined, UserOutlined } from '@ant-design/icons';
import { OrganizationBase } from '@dogu-private/console';
import { MenuProps, Tooltip } from 'antd';
import { List } from 'antd';
import { AxiosError, isAxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { leaveOrgization } from '../../api/user';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import useRefresh from '../../hooks/useRefresh';
import useAuthStore from '../../stores/auth';
import useEventStore from '../../stores/events';
import { flexRowBaseStyle, listItemStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import ErrorBox from '../common/boxes/ErrorBox';
import ListEmpty from '../common/boxes/ListEmpty';
import ProfileImage from '../ProfileImage';

interface Props {
  organization: OrganizationBase;
}

const OrganizationListItem = ({ organization }: Props) => {
  const { me } = useAuthStore();
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleLeave = async () => {
    if (!me) {
      return;
    }

    try {
      await leaveOrgization(me.userId, organization.organizationId);
      sendSuccessNotification(t('account:leaveOrganizationSuccessMessage'));
      fireEvent('onOrganizationLeft');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('account:leaveOrganizationFailureMessage', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <MenuItemButton
          onConfirm={handleLeave}
          modalTitle={t('account:leaveOraganizationModalTitle')}
          modalContent={
            <p>
              <Trans
                i18nKey="account:leaveOrganizationModalDescription"
                components={{ b: <b style={{ fontWeight: '700' }} /> }}
                values={{ organizationName: organization.name }}
              />
              <br />
              {t('account:leaveOrganizationModalDescription2')}
            </p>
          }
          danger
          modalButtonTitle={t('account:leaveOrganizationConfirmButtonText')}
        >
          {t('account:leaveOrganizationMenuText')}
        </MenuItemButton>
      ),
      key: 'leave',
    },
  ];

  return (
    <ItemBox>
      <FlexRowBox>
        <Col flex={2}>
          <StyledLink href={`/dashboard/${organization.organizationId}`}>
            <ProfileImage
              shape="square"
              profileImageUrl={organization.profileImageUrl}
              size={32}
              name={organization.name}
            />
            <OrgName>{organization.name}</OrgName>
          </StyledLink>
        </Col>
        <Col flex={2}>
          {t('account:organizationListOwnerText')}
          <Tooltip title={organization.owner?.name}>
            <ProfileImage
              style={{ marginLeft: '.3rem', fontSize: '.8rem' }}
              shape="circle"
              size="small"
              name={organization.owner?.name}
              profileImageUrl={organization.owner?.profileImageUrl}
            />
          </Tooltip>
        </Col>
        <Col flex={2}>
          <UserOutlined style={{ marginRight: '.5rem' }} />
          {organization.users?.length}&nbsp;
          {organization.users && organization.users.length > 1
            ? t('account:organizationListMemberPluralText')
            : t('account:organizationListMemberSingularText')}
        </Col>
        <Col flex={1} style={{ justifyContent: 'flex-end' }}>
          {/* <MenuButton menu={{ items }} /> */}
        </Col>
      </FlexRowBox>
    </ItemBox>
  );
};

const OrganizationListController = () => {
  const { me } = useAuthStore();
  const { data, isLoading, isValidating, error, page, updatePage, mutate } = usePaginationSWR<OrganizationBase>(
    me && `/users/${me.userId}/organizations`,
  );
  const router = useRouter();

  useRefresh(['onRefreshClicked', 'onOrganizationCreated', 'onOrganizationLeft'], () => mutate());

  if (isLoading) {
    return null;
  }

  if (!data || error) {
    if (error) {
      return (
        <ErrorBox
          title="Something went wrong"
          desc={isAxiosError(error) ? getErrorMessageFromAxios(error) : 'Cannot get organizations information'}
        />
      );
    }

    return null;
  }

  return (
    <Box>
      <List<OrganizationBase>
        access-id="organization-list"
        dataSource={data.items}
        renderItem={(item) => <OrganizationListItem organization={item} />}
        rowKey={(item) => item.organizationId}
        pagination={{
          defaultCurrent: 1,
          pageSize: 10,
          current: Number(page) || 1,
          onChange: (p) => {
            updatePage(p);
          },
          total: data.totalCount,
        }}
        locale={{
          emptyText: (
            <ListEmpty
              image={<BankOutlined style={{ fontSize: '90px' }} />}
              description={
                <Trans
                  i18nKey="account:emptyOrganizationDescription"
                  components={{
                    br: <br />,
                    link: <Link href="https://docs.dogutech.io/get-started" target="_blank" />,
                  }}
                />
              }
            />
          ),
        }}
      />
    </Box>
  );
};

export default OrganizationListController;

const Box = styled.div``;

const ItemBox = styled(List.Item)`
  ${listItemStyle}
`;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;

const Col = styled.div<{ flex: number }>`
  ${flexRowBaseStyle}
  flex: ${(props) => props.flex};
`;

const StyledLink = styled(Link)`
  ${flexRowBaseStyle}
`;

const OrgName = styled.p`
  margin-left: 0.5rem;
  font-weight: 500;
  color: ${(props) => props.theme.colorPrimary};
`;
