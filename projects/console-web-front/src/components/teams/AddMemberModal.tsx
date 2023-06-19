import { OrganizationId, TeamId } from '@dogu-private/types';
import { PageBase, UserBase } from '@dogu-private/console';
import { useCallback } from 'react';
import { AxiosError } from 'axios';
import { Empty, Input, message, Modal } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';

import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';
import { swrAuthFetcher } from 'src/api';
import AddMemberItem from '../AddMemberItem';
import { addUserToTeam } from 'src/api/team';
import Profile from '../Profile';
import { getErrorMessage } from 'src/utils/error';
import useEventStore from 'src/stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

interface Props {
  isOpen: boolean;
  close: () => void;
  organizationId: OrganizationId;
  teamId: TeamId;
}

const AddMemberModal = ({ isOpen, close, organizationId, teamId }: Props) => {
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, error, isLoading } = useSWR<PageBase<UserBase>>(
    isOpen && !!debouncedValue && `/organizations/${organizationId}/users?page=1&offset=10&keyword=${debouncedValue}`,
    swrAuthFetcher,
  );
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const isAPILoading = !!debouncedValue && !data && !error;

  const handleAddMember = useCallback(
    async (user: UserBase) => {
      try {
        await addUserToTeam(organizationId, teamId, { userId: user.userId });
        sendSuccessNotification(t('team:addMemberSuccessMsg'));
        fireEvent('onTeamMemberAdded');
        handleChangeValues('');
        close();
      } catch (e) {
        if (e instanceof AxiosError) {
          sendErrorNotification(t('team:addMemberFailMsg', { reason: getErrorMessage(e) }));
        }
      }
    },
    [organizationId, teamId, close, handleChangeValues],
  );

  const handleClose = () => {
    handleChangeValues('');
    close();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={t('team:addMemberModalTitle')}
      centered
      destroyOnClose
      footer={null}
      okButtonProps={{
        id: 'add-team-member-modal-ok-button',
      }}
    >
      <Input.Search
        loading={isAPILoading}
        placeholder={t('team:addMemberModalInputPlaceholder')}
        value={inputValue}
        onChange={(e) => handleChangeValues(e.target.value)}
        allowClear
        access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'add-team-member-input' : undefined}
      />

      {data &&
        (data.totalCount > 0 ? (
          <ListContainer>
            {data.items.map((item) => (
              <AddMemberItem
                key={`user-${item.userId}`}
                profile={<Profile profileImageUrl={item.profileImageUrl} name={item.name} desc={item.email} showProfileImage />}
                onAddClick={() => handleAddMember(item)}
                isJoined={!!item.teams?.find((team) => team.teamId === teamId)}
              />
            ))}
          </ListContainer>
        ) : (
          <Empty description={t('team:addMemberEmptyResult')} />
        ))}
    </Modal>
  );
};

export default AddMemberModal;

const ListContainer = styled.div`
  margin-top: 1rem;
`;
