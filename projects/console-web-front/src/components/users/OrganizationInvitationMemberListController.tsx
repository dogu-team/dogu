import { UserAndInvitationTokenBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { List, MenuProps } from 'antd';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';

import usePaginationSWR from '../../hooks/usePaginationSWR';
import MenuButton from '../buttons/MenuButton';
import MenuItemButton from '../buttons/MenuItemButton';
import { organizationRoleText } from '../../utils/mapper';
import { flexRowBaseStyle, listItemStyle, tableHeaderStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import { checkExpiredInvitation } from '../../utils/user';
import { cancelInvitation, inviteUsers } from '../../api/organization';
import useRefresh from '../../hooks/useRefresh';
import { INVITATION_STATUS, ORGANIZATION_ROLE } from '../../types/organization';
import useEventStore from '../../stores/events';
import InvitationStatusTag from '../../components/users/InvitationStatusTag';
import ListEmpty from '../../components/common/boxes/ListEmpty';
import { MailOutlined } from '@ant-design/icons';

interface ItemProps {
  invitation: UserAndInvitationTokenBase;
}

const InvitationMemberItem = ({ invitation }: ItemProps) => {
  const router = useRouter();
  const status = checkExpiredInvitation(new Date(invitation.updatedAt)) ? INVITATION_STATUS.EXPIRED : INVITATION_STATUS.PENDING;
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const handleResend = async () => {
    try {
      const { email, organizationId, organizationRoleId } = invitation;
      await inviteUsers(organizationId, { email, organizationRoleId });
      sendSuccessNotification('Success');
      fireEvent('onInvitationSent');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to send.\n${getErrorMessage(e)}`);
      }
    }
  };

  const handleCancel = async () => {
    try {
      await cancelInvitation(invitation.organizationId, invitation.email);
      sendSuccessNotification('Canceled');
      fireEvent('onInvitationCanceled');
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(`Failed to cancel.\n${getErrorMessage(e)}`);
      }
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'resend',
      label: (
        <MenuItemButton danger={false} onClick={handleResend}>
          {t('org-member:invitationResendMenuTitle')}
        </MenuItemButton>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'Cancel',
      label: (
        <MenuItemButton
          danger
          onConfirm={handleCancel}
          modalTitle={t('org-member:invitationCancelModalTitle')}
          modalButtonTitle={t('org-member:invitationCancelConfirmButtonText')}
          modalContent={
            <p>
              <Trans i18nKey="org-member:invitationCancelModalDescription" components={{ b: <b style={{ fontWeight: '700' }} /> }} values={{ email: invitation.email }} />
            </p>
          }
        >
          {t('org-member:invitationCancelMenuTitle')}
        </MenuItemButton>
      ),
    },
  ];

  return (
    <Item>
      <ItemInner>
        <ThreeSpan>{invitation.email}</ThreeSpan>
        <TwoSpan>{organizationRoleText[invitation.organizationRoleId as ORGANIZATION_ROLE]}</TwoSpan>
        <TwoSpan>
          <InvitationStatusTag status={status} />
        </TwoSpan>
        <TwoSpan>{`${Intl.DateTimeFormat(router.locale).format(new Date(invitation.updatedAt))}`}</TwoSpan>
        <Menu>
          <MenuButton menu={{ items }} />
        </Menu>
      </ItemInner>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
}

const OrganizationInvitationMemberListController = ({ organizationId }: Props) => {
  const { data, isLoading, error, page, updatePage, mutate } = usePaginationSWR<UserAndInvitationTokenBase>(`/organizations/${organizationId}/invitations`);
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onInvitationSent', 'onInvitationCanceled'], mutate);

  return (
    <>
      <Header>
        <ItemInner>
          <ThreeSpan>{t('org-member:invitationTableEmailColumn')}</ThreeSpan>
          <TwoSpan>{t('org-member:invitationTablePermissionColumn')}</TwoSpan>
          <TwoSpan>{t('org-member:invitationTableStatusColumn')}</TwoSpan>
          <TwoSpan>{t('org-member:invitationTableDateColumn')}</TwoSpan>
          <Menu></Menu>
        </ItemInner>
      </Header>
      <List<UserAndInvitationTokenBase>
        dataSource={data?.items}
        loading={isLoading}
        renderItem={(item) => <InvitationMemberItem invitation={item} />}
        rowKey={(item) => `org-invitations-${item.email}`}
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
        locale={{
          emptyText: <ListEmpty image={<MailOutlined style={{ fontSize: '90px' }} />} description={t('org-member:invitationEmptyDescription')} />,
        }}
      />
    </>
  );
};

export default OrganizationInvitationMemberListController;

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

const ThreeSpan = styled(Cell)`
  flex: 3;
`;

const TwoSpan = styled(Cell)`
  flex: 2;
`;

const OneSpan = styled(Cell)`
  flex: 1;
`;

const Menu = styled(OneSpan)`
  ${flexRowBaseStyle}
  justify-content: flex-end;
`;
