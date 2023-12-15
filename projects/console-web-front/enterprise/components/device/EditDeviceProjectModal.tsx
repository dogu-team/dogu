import { ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
import { DeviceBase, PageBase, ProjectBase } from '@dogu-private/console';
import { ProjectId, PROJECT_NAME_MAX_LENGTH } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { Checkbox, Input, Modal, Tag } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';

import { swrAuthFetcher } from '../../../src/api/index';
import { removeDeviceFromProject } from '../../../src/api/device';
import useDebouncedInputValues from '../../../src/hooks/useDebouncedInputValues';
import useEventStore from '../../../src/stores/events';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { enableDevice } from '../../api/device';
import { isPaymentRequired } from '../../utils/error';
import useModal from '../../../src/hooks/useModal';
import ProjectTypeIcon from '../../../src/components/projects/ProjectTypeIcon';
import UpgradePlanModal from '../../../src/components/billing/UpgradePlanModal';
import useBillingPlanPurchaseStore from '../../../src/stores/billing-plan-purchase';

interface Props {
  device: DeviceBase;
  isGlobal: boolean;
  isOpen: boolean;
  close: () => void;
}

const EditDeviceProjectModal = ({ device, isOpen, close, isGlobal: isGlobalProp }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId;
  const [showResult, setShowResult] = useState(false);
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data: deviceProjects, mutate: mutateDeviceProjects } = useSWR<ProjectBase[]>(
    `/organizations/${orgId}/devices/${device.deviceId}/projects`,
    swrAuthFetcher,
  );
  const { data: projects, isLoading: isProjectLoading } = useSWR<PageBase<ProjectBase>>(
    orgId && `/organizations/${orgId}/projects?keyword=${debouncedValue}`,
    swrAuthFetcher,
    {
      keepPreviousData: true,
    },
  );
  const [isBannerOpen, openBanner, closeBanner] = useModal();
  const [isGlobal, setIsGlobal] = useState(isGlobalProp);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();
  const updateBillingGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);

  useEffect(() => {
    if (isOpen) {
      setIsGlobal(isGlobalProp);
    }
  }, [isOpen, isGlobalProp]);

  const handleAddProject = async (projectId: ProjectId) => {
    try {
      await enableDevice(orgId as OrganizationId, device.deviceId, { isGlobal: false, projectId });
      mutateDeviceProjects();
      sendSuccessNotification(t('device-farm:addDeviceToProjectSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        if (isPaymentRequired(e)) {
          close();
          updateBillingGroupType('self-device-farm-group');
          openBanner();
        } else {
          sendErrorNotification(t('device-farm:addDeviceToProjectFailureMsg', { reason: getErrorMessageFromAxios(e) }));
        }
      }
    }
  };

  const handleToggleGlobal = async (checked: boolean) => {
    setIsGlobal(checked);
    try {
      await enableDevice(orgId as OrganizationId, device.deviceId, { isGlobal: checked });
      sendSuccessNotification(t('device-farm:toggleDeviceAsGlobalSuccessMsg'));
      mutateDeviceProjects();
    } catch (e) {
      if (e instanceof AxiosError) {
        if (isPaymentRequired(e)) {
          close();
          updateBillingGroupType('self-device-farm-group');
          openBanner();
        } else {
          sendErrorNotification(
            t('device-farm:toggleDeviceAsGlobalFailureMsg', { reason: getErrorMessageFromAxios(e) }),
          );
        }
      }
      setIsGlobal(isGlobalProp);
    }
  };

  const handleDeleteProject = async (projectId: ProjectId) => {
    try {
      await removeDeviceFromProject(orgId as OrganizationId, device.deviceId, projectId);
      mutateDeviceProjects();
      sendSuccessNotification(t('device-farm:removeDeviceFromProjectSuccessMsg'));
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(
          t('device-farm:removeDeviceFromProjectFailureMsg', {
            reason: getErrorMessageFromAxios(e),
          }),
        );
      }
    }
  };

  const handleClose = () => {
    close();
    fireEvent('onAddDeviceToProjectModalClosed');
  };

  return (
    <>
      <Modal
        title={t('device-farm:deviceEditProjectModalTitle')}
        closable
        onCancel={handleClose}
        open={isOpen}
        centered
        footer={null}
      >
        <Box>
          <ContentTitle>{t('device-farm:deviceEditProjectSearchTitle')}</ContentTitle>
          <InputWrapper>
            <Input.Search
              value={inputValue}
              onChange={(e) => handleChangeValues(e.target.value)}
              disabled={isGlobal}
              loading={isProjectLoading}
              onBlur={() => setShowResult(false)}
              onFocus={() => setShowResult(true)}
              allowClear
              placeholder={t('device-farm:deviceEditProjectSearchInputPlaceholder')}
              maxLength={PROJECT_NAME_MAX_LENGTH}
            />

            {showResult && (
              <ResultContainer>
                {projects?.items.map((item) => {
                  return (
                    <ResultItem
                      key={`add-project-${item.projectId}`}
                      onMouseDown={() => handleAddProject(item.projectId)}
                    >
                      <ProjectTypeIcon type={item.type} style={{ marginRight: '.25rem' }} /> {item.name}
                    </ResultItem>
                  );
                })}
              </ResultContainer>
            )}
          </InputWrapper>

          <SelectedProjectBox>
            <ContentTitle>{t('device-farm:deviceEditProjectDeviceProjectTitle')}</ContentTitle>
            <TagContainer>
              {deviceProjects?.map((item) => {
                return (
                  <Tag
                    key={`device-${device.deviceId}-${item.projectId}`}
                    closable
                    onClose={() => handleDeleteProject(item.projectId)}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ProjectTypeIcon
                      type={item.type}
                      style={{ marginRight: '.25rem', width: '12px', height: '12px' }}
                    />{' '}
                    {item.name}
                  </Tag>
                );
              })}
            </TagContainer>
            {!isGlobal && !!deviceProjects && deviceProjects.length === 0 && (
              <div>
                <ExclamationCircleFilled style={{ color: 'red' }} />
                &nbsp;{t('device-farm:deviceEditProjectEmptyProjectText')}
              </div>
            )}
          </SelectedProjectBox>

          <GlobalCheckBoxWrapper>
            <Checkbox
              checked={isGlobal}
              onChange={(e) => handleToggleGlobal(e.target.checked)}
              id="use-as-public-device-checkbox"
            >
              {t('device-farm:deviceEditProjectGlobalLabelText')}
            </Checkbox>

            <WarningBox>
              <WarningFilled style={{ color: '#f8b118', fontSize: '1.2rem' }} />
              <p>{t('device-farm:deviceEditProjectGlobalWarningText')}</p>
            </WarningBox>
          </GlobalCheckBoxWrapper>
        </Box>
      </Modal>

      <UpgradePlanModal isOpen={isBannerOpen} close={closeBanner} />
    </>
  );
};

export default EditDeviceProjectModal;

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
