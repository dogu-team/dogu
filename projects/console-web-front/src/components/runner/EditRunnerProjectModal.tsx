import { ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
import { PageBase, ProjectBase } from '@dogu-private/console';
import { ProjectId, PROJECT_NAME_MAX_LENGTH } from '@dogu-private/types';
import { DeviceId, OrganizationId } from '@dogu-private/types';
import { Checkbox, Input, Modal, Tag } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';

import { swrAuthFetcher } from '../../api/index';
import { enableDevice, removeDeviceFromProject } from '../../api/device';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import useEventStore from '../../stores/events';
import { getErrorMessage } from '../../utils/error';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

interface Props {
  runnerId: DeviceId;
  isGlobal: boolean;
  isOpen: boolean;
  close: () => void;
}

const EditRunnerProjectModal = ({ runnerId, isOpen, close, isGlobal: isGlobalProp }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId;
  const [showResult, setShowResult] = useState(false);
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const {
    data: runnerProjects,
    error: runnerProjectError,
    mutate: mutateRunnerProjects,
    isLoading: isRunnerProjectLoading,
  } = useSWR<ProjectBase[]>(`/organizations/${orgId}/devices/${runnerId}/projects`, swrAuthFetcher);
  const {
    data: projects,
    isLoading: isProjectLoading,
    error: isProjectError,
    mutate: mutateProjects,
  } = useSWR<PageBase<ProjectBase>>(orgId && `/organizations/${orgId}/projects?keyword=${debouncedValue}`, swrAuthFetcher, {
    keepPreviousData: true,
  });
  const [isGlobal, setIsGlobal] = useState(isGlobalProp);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setIsGlobal(isGlobalProp);
    }
  }, [isOpen, isGlobalProp]);

  const handleAddProject = async (projectId: ProjectId) => {
    try {
      await enableDevice(orgId as OrganizationId, runnerId, { isGlobal: false, projectId });
      mutateRunnerProjects();
      sendSuccessNotification(t('runner:addRunnerToProjectSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('runner:addRunnerToProjectFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleToggleGlobal = async (checked: boolean) => {
    setIsGlobal(checked);
    try {
      await enableDevice(orgId as OrganizationId, runnerId, { isGlobal: checked });
      sendSuccessNotification(t('runner:toggleRunnerAsGlobalSuccessMsg'));
      mutateRunnerProjects();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('runner:toggleRunnerAsGlobalFailureMsg', { reason: getErrorMessage(e) }));
      }
      setIsGlobal(isGlobalProp);
    }
  };

  const handleDeleteProject = async (projectId: ProjectId) => {
    try {
      await removeDeviceFromProject(orgId as OrganizationId, runnerId, projectId);
      mutateRunnerProjects();
      sendSuccessNotification(t('runner:removeRunnerFromProjectSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('runner:removeRunnerFromProjectFailureMsg', { reason: getErrorMessage(e) }));
      }
    }
  };

  const handleClose = () => {
    close();
    fireEvent('onAddDeviceToProjectModalClosed');
  };

  return (
    <Modal title={t('runner:runnerEditProjectModalTitle')} closable onCancel={handleClose} open={isOpen} centered footer={null}>
      <Box>
        <ContentTitle>{t('runner:runnerEditProjectSearchTitle')}</ContentTitle>
        <InputWrapper>
          <Input.Search
            value={inputValue}
            onChange={(e) => handleChangeValues(e.target.value)}
            disabled={isGlobal}
            loading={isProjectLoading}
            onBlur={() => setShowResult(false)}
            onFocus={() => setShowResult(true)}
            allowClear
            placeholder={t('runner:runnerEditProjectSearchInputPlaceholder')}
            maxLength={PROJECT_NAME_MAX_LENGTH}
          />

          {showResult && (
            <ResultContainer>
              {projects?.items.map((item) => {
                return (
                  <ResultItem key={`add-project-${item.projectId}`} onMouseDown={() => handleAddProject(item.projectId)}>
                    {item.name}
                  </ResultItem>
                );
              })}
            </ResultContainer>
          )}
        </InputWrapper>

        <SelectedProjectBox>
          <ContentTitle>{t('runner:runnerEditProjectDeviceProjectTitle')}</ContentTitle>
          <TagContainer>
            {runnerProjects?.map((item) => {
              return (
                <Tag key={`runner-${runnerId}-${item.projectId}`} closable onClose={() => handleDeleteProject(item.projectId)}>
                  {item.name}
                </Tag>
              );
            })}
          </TagContainer>
          {!isGlobal && !!runnerProjects && runnerProjects.length === 0 && (
            <div>
              <ExclamationCircleFilled style={{ color: 'red' }} />
              &nbsp;{t('runner:runnerEditProjectEmptyProjectText')}
            </div>
          )}
        </SelectedProjectBox>

        <GlobalCheckBoxWrapper>
          <Checkbox checked={isGlobal} onChange={(e) => handleToggleGlobal(e.target.checked)}>
            {t('runner:runnerEditProjectGlobalLabelText')}
          </Checkbox>

          <WarningBox>
            <WarningFilled style={{ color: '#f8b118', fontSize: '1.2rem' }} />
            <p>{t('runner:runnerEditProjectGlobalWarningText')}</p>
          </WarningBox>
        </GlobalCheckBoxWrapper>
      </Box>
    </Modal>
  );
};

export default EditRunnerProjectModal;

const Box = styled.div``;

const ContentTitle = styled.p`
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const ResultContainer = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-radius: 8px;
  max-height: 200px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  z-index: 1;
`;

const ResultItem = styled.button`
  width: 100%;
  display: flex;
  background-color: #ffffff;
  color: #000;
  padding: 0.5rem 1rem;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  :hover {
    background-color: ${(props) => props.theme.colors.gray2};
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const SelectedProjectBox = styled.div`
  margin-top: 1rem;
`;

const GlobalCheckBoxWrapper = styled.div`
  margin-top: 1rem;
`;

const WarningBox = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  border-radius: 8px;
  border: 1px solid #f8b118;
  background-color: #fbe4aa;
  padding: 8px;
`;
