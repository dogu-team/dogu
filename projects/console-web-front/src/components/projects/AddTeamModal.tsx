import { PageBase, TeamBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, ProjectRoleId, TEAM_NAME_MAX_LENGTH } from '@dogu-private/types';
import { Input, Modal } from 'antd';
import { useCallback } from 'react';
import useSWR from 'swr';
import { AxiosError, AxiosResponse } from 'axios';
import useTranslation from 'next-translate/useTranslation';

import { swrAuthFetcher } from 'src/api';
import useEventStore from 'src/stores/events';
import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';
import { getErrorMessage } from 'src/utils/error';
import { addTeamToProject } from 'src/api/project';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import useRequest from '../../hooks/useRequest';
import PermissionSelectContentBox from '../PermissionSelectContentBox';
import styled from 'styled-components';
import { flexRowSpaceBetweenStyle } from '../../styles/box';

interface Props {
  isOpen: boolean;
  close: () => void;
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const AddTeamModal = ({ isOpen, close, organizationId, projectId }: Props) => {
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { data, error, mutate, isLoading } = useSWR<PageBase<TeamBase>>(
    !!debouncedValue && organizationId && `/organizations/${organizationId}/teams?keyword=${debouncedValue}&page=1&offset=10`,
    swrAuthFetcher,
  );
  const { t } = useTranslation();
  const [loading, request] = useRequest<Parameters<typeof addTeamToProject>, AxiosResponse<void>>(addTeamToProject);
  const isAPILoading = !!debouncedValue && isLoading;

  const resetAndClose = useCallback(() => {
    handleChangeValues('');
    close();
  }, []);

  const handleAddTeam = useCallback(
    async (team: TeamBase, permission: ProjectRoleId) => {
      try {
        await request(organizationId, projectId, { teamId: team.teamId, projectRoleId: permission });
        mutate();
        sendSuccessNotification(t('project-member:addProjectMemberSuccessMsg'));
        fireEvent('onProjectMemberAdded');
        resetAndClose();
      } catch (e) {
        if (e instanceof AxiosError) {
          sendErrorNotification(t('project-member:addProjectMemberFailMsg', { reason: getErrorMessage(e) }));
        }
      }
    },
    [request, resetAndClose],
  );

  return (
    <Modal open={isOpen} centered destroyOnClose onCancel={resetAndClose} footer={null} title={t('project-member:addProjectTeamModalTitle')}>
      <PermissionSelectContentBox<TeamBase>
        input={
          <Input.Search
            placeholder={t('project-member:addProjectTeamInputPlaceholder')}
            value={inputValue}
            onChange={(e) => handleChangeValues(e.target.value)}
            maxLength={TEAM_NAME_MAX_LENGTH}
            allowClear
            loading={isAPILoading}
          />
        }
        renderSelectedItem={(item) => {
          return <Text>{item.name}</Text>;
        }}
        searchResultItems={data?.items}
        renderSearchResultItem={(item) => (
          <FlexSpaceBetweenBox>
            <Text>{item.name}</Text>
            {!!item.projectAndTeamAndProjectRoles?.find((tr) => tr.projectId === projectId) && <Text>Already joined</Text>}
          </FlexSpaceBetweenBox>
        )}
        itemKey={(item) => `add-team-${item.teamId}`}
        itemDisabled={(item) => !!item.projectAndTeamAndProjectRoles?.find((tr) => tr.projectId === projectId)}
        onSubmit={handleAddTeam}
        submitButtonText={t('project-member:addProjectMemberSubmitButtonTitle')}
        loading={loading}
      />
    </Modal>
  );
};

export default AddTeamModal;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
`;

const Text = styled.p`
  line-height: 1.5;
`;
