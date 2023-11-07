import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { HostBase, SelfHostedLicenseResponse } from '@dogu-private/console';
import { HostConnectionState } from '@dogu-private/types';
import { Button, Tag, Tooltip } from 'antd';
import { useContext } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import { isAxiosError } from 'axios';

import { DoguAgentLatestContext } from '../../../pages/dashboard/[orgId]/device-farm/hosts';
import { parseSemver } from '../../../src/utils/download';
import { getAgentUpdatableInfo } from '../../utils/host';
import ProTag from '../common/ProTag';
import useModal from '../../../src/hooks/useModal';
import DangerConfirmModal from '../../../src/components/modals/DangerConfirmModal';
import useRequest from '../../../src/hooks/useRequest';
import { updateHostApp } from '../../api/host';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import useOrganizationContext from '../../../src/hooks/context/useOrganizationContext';
import { isPaymentRequired, isTimeout } from '../../utils/error';
import { UpgradeConveniencePlanModal } from '../license/UpgradePlanBannerModal';
import TimeoutDocsModal from '../license/TimeoutDocsModal';
import { checkCommunityEdition } from '../../utils/license';

interface Props {
  host: HostBase;
}

const HostVesrsionBadge = ({ host }: Props) => {
  const latestContext = useContext(DoguAgentLatestContext);
  const { license } = useOrganizationContext();
  const [isOpen, openModal, closeModal] = useModal();
  const [isBannerOpen, openBanner, closeBanner] = useModal();
  const [isDocsOtpen, openDocs, closeDocs] = useModal();
  const [loading, request] = useRequest(updateHostApp);
  const { t } = useTranslation();

  if (!host.agentVersion) {
    return <Tag color="default">N/A</Tag>;
  }

  const handleHostAppUpdate = async () => {
    try {
      await request(host.organizationId, host.hostId);
      sendSuccessNotification(t('device-farm:hostUpdateSuccessMsg'));
      closeModal();
    } catch (e) {
      if (isAxiosError(e)) {
        if (isPaymentRequired(e)) {
          openBanner();
        } else if (isTimeout(e)) {
          openDocs();
        } else {
          sendErrorNotification(t('device-farm:hostUpdateFailMsg', { reason: getErrorMessageFromAxios(e) }));
        }
      }
    }
  };

  const currentVersion = parseSemver(process.env.NEXT_PUBLIC_DOGU_VERSION);
  const agentVersion = parseSemver(host.agentVersion);

  const isMajorMatched = currentVersion.major === agentVersion.major;
  const isMatched = isMajorMatched && currentVersion.minor === agentVersion.minor;

  const updatableInfo = getAgentUpdatableInfo(latestContext.latestInfo, host);
  const updatable =
    host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED && updatableInfo.isUpdatable;
  const shouldShowUpdateButton =
    host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED &&
    (updatableInfo.reason || updatableInfo.isUpdatable);
  const isCommunityEdition =
    process.env.NEXT_PUBLIC_ENV === 'self-hosted' &&
    (!license || checkCommunityEdition(license as SelfHostedLicenseResponse));

  return (
    <>
      <Tooltip
        title={
          host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED && updatableInfo.reason
            ? updatableInfo.reason
            : host.connectionState !== HostConnectionState.HOST_CONNECTION_STATE_CONNECTED
            ? t('device-farm:doguAgentUpdateDisconnectedMessage')
            : t('device-farm:doguAgentVersionMismatchMessage', {
                doguVersion: process.env.NEXT_PUBLIC_DOGU_VERSION,
                agentVersion: host.agentVersion,
              })
        }
        open={!updatableInfo.reason && isMatched ? false : undefined}
        overlayInnerStyle={{ fontSize: '.8rem', textAlign: 'center', whiteSpace: 'pre-wrap' }}
      >
        {shouldShowUpdateButton ? (
          <FlexButton
            disabled={!updatable}
            type="primary"
            onClick={() => {
              if (isCommunityEdition) {
                openBanner();
              } else {
                openModal();
              }
            }}
          >
            {t('device-farm:doguAgentUpdateAvailableMessage')}&nbsp;
            <b style={{ fontSize: '.75rem' }}>{`(current: ${host.agentVersion})`}</b>
            {isCommunityEdition && <ProTag style={{ marginLeft: '.5rem' }} />}
          </FlexButton>
        ) : (
          <Tag
            color={isMatched ? 'green' : 'error'}
            icon={
              isMatched ? (
                <CheckCircleOutlined />
              ) : isMajorMatched ? (
                <ExclamationCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )
            }
          >
            {host.agentVersion}
          </Tag>
        )}
      </Tooltip>

      <DangerConfirmModal
        open={isOpen}
        onOk={handleHostAppUpdate}
        onCancel={closeModal}
        confirmLoading={loading}
        title={t('device-farm:hostItemUpdateMenu')}
        buttonTitle={t('device-farm:hostUpdateModalButtonText')}
        buttonProps={{ id: 'host-update-confirm-btn' }}
      >
        <p>{t('device-farm:hostUpdateModalContentInfo')}</p>
      </DangerConfirmModal>
      <UpgradeConveniencePlanModal
        isOpen={isBannerOpen}
        close={closeBanner}
        title={t('billing:agentUpdateModalTitle')}
        description={null}
      />
      <TimeoutDocsModal isOpen={isDocsOtpen} close={closeDocs} />
    </>
  );
};

export default HostVesrsionBadge;

const FlexButton = styled(Button)`
  display: flex;
  align-items: center;
`;
