import { HostBase } from '@dogu-private/console';
import { EDITION_TYPE, OrganizationId } from '@dogu-private/types';
import { Tag, Tooltip } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useContext } from 'react';
import styled from 'styled-components';

import { DoguAgentLatestContext } from '../../../../pages/dashboard/[orgId]/device-farm/hosts';
import MenuItemButton from '../../../components/buttons/MenuItemButton';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessageFromAxios } from '../../../utils/error';
import { updateHostApp } from '../../api/host';
import useFeatureContext from '../../contexts/feature';
import { getAgentUpdatableInfo } from '../../utils/host';

interface Props {
  organizationId: OrganizationId;
  host: HostBase;
  isTooltipVisible: boolean;
}

const HostUpdateMenuButton = ({ host, organizationId, isTooltipVisible }: Props) => {
  const { t } = useTranslation();
  const latestContext = useContext(DoguAgentLatestContext);
  const featureContext = useFeatureContext();

  const updatableInfo = getAgentUpdatableInfo(latestContext.latestInfo, host);
  const updatable = featureContext?.defaultEdition === EDITION_TYPE.ENTERPRISE && updatableInfo.isUpdatable;

  const handleHostAppUpdate = async () => {
    try {
      await updateHostApp(organizationId, host.hostId);
      sendSuccessNotification(t('device-farm:hostUpdateSuccessMsg'));
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(t('device-farm:hostUpdateFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  return (
    <Tooltip title={updatableInfo.reason} placement="left" open={!!updatableInfo.reason && featureContext?.defaultEdition === EDITION_TYPE.ENTERPRISE && isTooltipVisible}>
      <MenuItemButton
        danger
        onConfirm={handleHostAppUpdate}
        modalTitle={t('device-farm:hostItemUpdateMenu')}
        modalButtonTitle={t('device-farm:hostUpdateModalButtonText')}
        modalContent={<StyledDeleteModalContent>{t('device-farm:hostUpdateModalContentInfo')}</StyledDeleteModalContent>}
        confirmButtonId="host-update-confirm-btn"
        disabled={!updatable}
      >
        {t('device-farm:hostItemUpdateMenu')}

        {featureContext?.defaultEdition === EDITION_TYPE.COMUINITIY && (
          <Tag color="cyan-inverse" style={{ marginLeft: '.5rem' }}>
            Pro ✨
          </Tag>
        )}

        {!updatable && featureContext?.defaultEdition === EDITION_TYPE.ENTERPRISE && updatableInfo.isLatest && (
          <Tag color="green" style={{ marginLeft: '.5rem' }}>
            Latest
          </Tag>
        )}
      </MenuItemButton>
    </Tooltip>
  );
};

export default HostUpdateMenuButton;

const StyledDeleteModalContent = styled.p`
  line-height: 1.4;

  b {
    font-weight: 500;
  }
`;
