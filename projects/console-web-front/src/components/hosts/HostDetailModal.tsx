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
    <Modal open={isOpen} closable onCancel={close} title={t('host:hostDetailModalTitle')} centered destroyOnClose footer={null}>
      <Box>
        <Content>
          <StyledH4>{t('host:hostDetilNameTitle')}</StyledH4>
          <p access-id="host-modal-name">{host?.name}</p>
        </Content>
        <Content>
          <StyledH4>{t('host:hostDetailCreatedDateTitle')}</StyledH4>
          <p>{getLocaleFormattedDate(lang, new Date(host?.createdAt ?? 0))}</p>
        </Content>
        <Content>
          <StyledH4>{t('host:hostDetailConnectedDeviceTitle')}</StyledH4>
          <div>
            {host?.devices?.map((item) => (
              <Tag key={item.deviceId}>{item.name}</Tag>
            ))}
          </div>

          <DeviceTotal>Total: {host?.devices?.length}</DeviceTotal>
        </Content>
        {host?.creator && (
          <Content>
            <StyledH4 id="host-creator-title">{t('host:hostDetailCreatorTitle')}</StyledH4>
            <ProfileImageWithName profileImage={<ProfileImage name={host.creator.name} size={36} profileImageUrl={host.creator.profileImageUrl} />} name={host.creator.name} />
          </Content>
        )}
        <Content>
          <StyledH4>{t('host:hostDetailTokenTitle')}</StyledH4>
          {token ? (
            <div>
              <code style={{ fontFamily: 'monospace' }}>{token}</code>
              <Button
                size="small"
                style={{ marginLeft: '.25rem' }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(token);
                    message.success(t('common:copyClipboard'));
                  } catch (e) {
                    message.error(t('common:copyClipboardFailed'));
                  }
                }}
                access-id="copy-host-token-btn"
              >
                {t('common:copy')}
              </Button>
            </div>
          ) : (
            <Button loading={loading} onClick={handleClickCheckToken} access-id="show-host-token-btn">
              {t('host:hostDetailShowTokenButtonTitle')}
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
