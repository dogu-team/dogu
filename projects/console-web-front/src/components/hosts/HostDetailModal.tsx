import { HostBase } from '@dogu-private/console';
import { Button, message, Modal, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

import { getLocaleFormattedDate } from 'src/utils/locale';
import ProfileImage from '../ProfileImage';
import ProfileImageWithName from '../users/ProfileImageWithName';
import useRequest from '../../hooks/useRequest';
import { getHostConnectionToken } from '../../api/host';
import { sendErrorNotification } from '../../utils/antd';
import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  isOpen: boolean;
  host: HostBase | null | undefined;
  close: () => void;
}

const HostDetailModal = ({ isOpen, host, close }: Props) => {
  const { t, lang } = useTranslation();
  const [token, setToken] = useState<string>();
  const [loading, request] = useRequest(getHostConnectionToken);

  const handleClickCheckToken = async () => {
    if (!host) {
      return;
    }

    try {
      const token = await request(host.organizationId, host.hostId);
      setToken(token);
    } catch (e) {
      sendErrorNotification(`Failed to check token`);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setToken(undefined);
    }
  }, [isOpen]);

  return (
    <Modal open={isOpen} closable onCancel={close} title={t('device-farm:hostDetailModalTitle')} centered destroyOnClose footer={null}>
      <Box>
        <Content>
          <StyledH4>{t('device-farm:hostDetilNameTitle')}</StyledH4>
          <p access-id="host-modal-name">{host?.name}</p>
        </Content>
        <Content>
          <StyledH4>{t('device-farm:hostDetailCreatedDateTitle')}</StyledH4>
          <p>{getLocaleFormattedDate(lang, new Date(host?.createdAt ?? 0))}</p>
        </Content>
        <Content>
          <StyledH4>{t('device-farm:hostDetailConnectedDeviceTitle')}</StyledH4>
          <div>
            {host?.devices?.map((item) => (
              <Tag key={item.deviceId}>{item.name}</Tag>
            ))}
          </div>

          <DeviceTotal>Total: {host?.devices?.length}</DeviceTotal>
        </Content>
        {host?.creator && (
          <Content>
            <StyledH4 id="host-creator-title">{t('device-farm:hostDetailCreatorTitle')}</StyledH4>
            <ProfileImageWithName profileImage={<ProfileImage name={host.creator.name} size={36} profileImageUrl={host.creator.profileImageUrl} />} name={host.creator.name} />
          </Content>
        )}
        <Content>
          <StyledH4>{t('device-farm:hostDetailTokenTitle')}</StyledH4>
          {token ? (
            <TokenCopyInput value={token} />
          ) : (
            <Button loading={loading} onClick={handleClickCheckToken} access-id="show-host-token-btn">
              {t('device-farm:hostDetailShowTokenButtonTitle')}
            </Button>
          )}
        </Content>
      </Box>
    </Modal>
  );
};

export default HostDetailModal;

const Box = styled.div``;

const Content = styled.div`
  margin-bottom: 1.5rem;
`;

const StyledH4 = styled.h4`
  margin-bottom: 0.2rem;
  font-size: 1.05rem;
  font-weight: 500;
`;

const DeviceTotal = styled.div`
  margin-top: 0.25rem;
`;
