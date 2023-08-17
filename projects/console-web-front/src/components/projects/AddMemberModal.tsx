import { PageBase, UserBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, ProjectRoleId, USER_NAME_MAX_LENGTH } from '@dogu-private/types';
import { Input, Modal } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';
import { AxiosError, AxiosResponse } from 'axios';

import { swrAuthFetcher } from 'src/api';
import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';
import { addUserToProject } from 'src/api/project';
import Profile from '../Profile';
import { getErrorMessageFromAxios } from 'src/utils/error';
import useEventStore from 'src/stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import PermissionSelectContentBox from '../PermissionSelectContentBox';
import useRequest from '../../hooks/useRequest';
import { flexRowSpaceBetweenStyle } from '../../styles/box';

interface Props {
  isOpen: boolean;
  close: () => void;
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const AddMemberModal = ({ isOpen, close, organizationId, projectId }: Props) => {
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, error, mutate, isLoading } = useSWR<PageBase<UserBase>>(
    isOpen && !!debouncedValue && `/organizations/${organizationId}/users?keyword=${debouncedValue}&page=1&offset=10`,
    swrAuthFetcher,
  );
  const isAPILoading = !!debouncedValue && isLoading;
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const [loading, request] = useRequest<Parameters<typeof addUserToProject>, AxiosResponse<void>>(addUserToProject);

  const handleClose = () => {
    handleChangeValues('');
    close();
  };

  const handleAddMember = async (user: UserBase, permission: ProjectRoleId) => {
    try {
      await request(organizationId, projectId, { userId: user.userId, projectRoleId: permission });
      mutate();
      sendSuccessNotification(t('project-member:addProjectMemberSuccessMsg'));
      fireEvent('onProjectMemberAdded');
      handleChangeValues('');
      close();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-member:addProjectMemberFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  return (
    <Modal open={isOpen} centered destroyOnClose onCancel={handleClose} footer={null} title={t('project-member:addProjectOrgMemberModalTitle')}>
      <PermissionSelectContentBox<UserBase>
        input={
          <Input.Search
            placeholder={t('project-member:addProjectOrgMemberInputPlaceholder')}
            value={inputValue}
            onChange={(e) => handleChangeValues(e.target.value)}
            maxLength={USER_NAME_MAX_LENGTH}
            allowClear
            loading={isAPILoading}
            access-id="add-project-member-input"
          />
        }
        searchResultItems={data?.items}
        renderSearchResultItem={(item) => {
          const isInProject = !!item.projects?.find((p) => p.projectId === projectId);

          return (
            <FlexRowSpaceBetweenBox>
              <Profile profileImageUrl={item.profileImageUrl} name={item.name} desc={item.email} showProfileImage />
              {isInProject && <Text>Already joined</Text>}
            </FlexRowSpaceBetweenBox>
          );
        }}
        renderSelectedItem={(item) => {
          return <Profile profileImageUrl={item.profileImageUrl} name={item.name} desc={item.email} showProfileImage />;
        }}
        itemKey={(item) => `add-member-${item.userId}`}
        itemDisabled={(item) => !!item.projects?.find((p) => p.projectId === projectId)}
        onSubmit={handleAddMember}
        submitButtonText={t('project-member:addProjectMemberSubmitButtonTitle')}
        loading={loading}
        emptyDescription={t('project-member:addProjectEmptyResult')}
      />
    </Modal>
  );
};

export default AddMemberModal;

const FlexRowSpaceBetweenBox = styled.div`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
`;

const Text = styled.p`
  line-height: 1.5;
`;
