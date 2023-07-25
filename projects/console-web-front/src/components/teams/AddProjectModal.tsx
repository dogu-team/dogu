import { PageBase, ProjectBase } from '@dogu-private/console';
import { OrganizationId, ProjectRoleId, TeamId } from '@dogu-private/types';
import { Input, Modal } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import { swrAuthFetcher } from 'src/api';
import { addTeamToProject } from 'src/api/project';
import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';
import useEventStore from 'src/stores/events';
import { getErrorMessage } from 'src/utils/error';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import PermissionSelectContentBox from '../PermissionSelectContentBox';
import useRequest from '../../hooks/useRequest';
import styled from 'styled-components';
import { flexRowSpaceBetweenStyle } from '../../styles/box';

interface Props {
  close: () => void;
  isOpen: boolean;
  organizationId: OrganizationId;
  teamId: TeamId;
}

const AddProjectModal = ({ close, isOpen, organizationId, teamId }: Props) => {
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, error, isLoading } = useSWR<PageBase<ProjectBase>>(
    // TODO
    isOpen && !!debouncedValue && `/organizations/${organizationId}/projects?keyword=${debouncedValue}`,
    swrAuthFetcher,
  );
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();
  const [loading, request] = useRequest(addTeamToProject);

  const handleClose = () => {
    handleChangeValues('');
    close();
  };

  const handleAddProject = async (project: ProjectBase, permission: ProjectRoleId) => {
    try {
      await request(organizationId, project.projectId, { teamId, projectRoleId: permission });
      sendSuccessNotification(t('team:projectAddSuccessMsg'));
      fireEvent('onTeamProjectAdded');
      handleClose();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('team:projectAddFailMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  return (
    <Modal open={isOpen} title={t('team:addProjectModalTitle')} onCancel={handleClose} closable footer={null} centered>
      <PermissionSelectContentBox<ProjectBase>
        input={
          <Input.Search
            loading={isOpen && !!debouncedValue && isLoading}
            value={inputValue}
            onChange={(e) => handleChangeValues(e.target.value)}
            allowClear
            placeholder={t('team:addProjectModalInputPlaceholder')}
            access-id="add-project-modal-input"
          />
        }
        searchResultItems={data?.items}
        renderSearchResultItem={(item) => (
          <FlexSpaceBetweenBox>
            <Text>{item.name}</Text>
            {!!item.teams?.some((team) => team.teamId === teamId) && <Text>Already joined</Text>}
          </FlexSpaceBetweenBox>
        )}
        renderSelectedItem={(item) => <Text>{item.name}</Text>}
        itemKey={(item) => `add-project-${item.projectId}`}
        itemDisabled={(item) => !!item.teams?.some((team) => team.teamId === teamId)}
        onSubmit={handleAddProject}
        submitButtonText={'Add to team'}
        loading={loading}
        emptyDescription={t('team:addProjectModalEmptyResult')}
      />
    </Modal>
  );
};

export default AddProjectModal;

const FlexSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
`;

const Text = styled.div`
  line-height: 1.5;
`;
