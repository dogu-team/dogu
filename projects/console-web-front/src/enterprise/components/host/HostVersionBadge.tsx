import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { HostBase } from '@dogu-private/console';
import { EDITION_TYPE, HostConnectionState } from '@dogu-private/types';
import { Button, Tag, Tooltip } from 'antd';
import { useContext } from 'react';
import styled from 'styled-components';

import { DoguAgentLatestContext } from '../../../../pages/dashboard/[orgId]/device-farm/hosts';
import { parseSemver } from '../../../utils/download';
import useFeatureContext from '../../contexts/feature';
import { getAgentUpdatableInfo } from '../../utils/host';
import ProTag from '../common/ProTag';
import useModal from '../../../hooks/useModal';
import DangerConfirmModal from '../../../components/modals/DangerConfirmModal';
import useTranslation from 'next-translate/useTranslation';
import useRequest from '../../../hooks/useRequest';
import { updateHostApp } from '../../api/host';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { isAxiosError } from 'axios';
import { getErrorMessageFromAxios } from '../../../utils/error';

interface Props {
  host: HostBase;
}

const HostVesrsionBadge = ({ host }: Props) => {
  const latestContext = useContext(DoguAgentLatestContext);
  const featureContext = useFeatureContext();
  const [isOpen, openModal, closeModal] = useModal();
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
        sendErrorNotification(t('device-farm:hostUpdateFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const currentVersion = parseSemver(process.env.NEXT_PUBLIC_DOGU_VERSION);
  const agentVersion = parseSemver(host.agentVersion);

  const isMajorMatched = currentVersion.major === agentVersion.major;
  const isMatched = isMajorMatched && currentVersion.minor === agentVersion.minor;

  const updatableInfo = getAgentUpdatableInfo(latestContext.latestInfo, host);
  const updatable =
    host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED &&
    featureContext?.defaultEdition === EDITION_TYPE.ENTERPRISE &&
    updatableInfo.isUpdatable;
  const shouldShowUpdateButton =
    host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED &&
    (updatableInfo.reason || updatableInfo.isUpdatable);

  return (
    <>
      <Tooltip
        title={
          host.connectionState === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED && updatableInfo.reason
            ? updatableInfo.reason
            : host.connectionState !== HostConnectionState.HOST_CONNECTION_STATE_CONNECTED
            ? `Updatable when connected`
            : `Dogu and Agent version not matched!\nThis can result in unexpected behavior.\nDogu: ${process.env.NEXT_PUBLIC_DOGU_VERSION}, Agent: ${host.agentVersion}`
        }
        open={!updatableInfo.reason && isMatched ? false : undefined}
        overlayInnerStyle={{ fontSize: '.8rem', textAlign: 'center', whiteSpace: 'pre-wrap' }}
      >
        {shouldShowUpdateButton ? (
          <FlexButton disabled={!updatable} type="primary" onClick={() => openModal()}>
            Update to latest&nbsp;
            <b style={{ fontSize: '.75rem' }}>{`(current: ${host.agentVersion})`}</b>
            {featureContext?.defaultEdition === EDITION_TYPE.COMUINITIY && <ProTag style={{ marginLeft: '.5rem' }} />}
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
    </>
  );
};

export default HostVesrsionBadge;

const FlexButton = styled(Button)`
  display: flex;
  align-items: center;
`;
