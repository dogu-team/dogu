import { DeviceBase } from '@dogu-private/console';
import { Modal, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { getLocaleFormattedDate } from 'src/utils/locale';
import DevicePrefixTag from './DevicePrefixTag';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  isOpen: boolean;
  device: DeviceBase;
  close: () => void;
}

const DeviceDetailModal = ({ isOpen, device, close }: Props) => {
  const { t, lang } = useTranslation();
  const isGlobal = device.isGlobal === 1;

  return (
    <Modal open={isOpen} closable onCancel={close} title={t('device-farm:deviceDetailModalTitle')} centered destroyOnClose footer={null}>
      <Box>
        <Content>
          <StyledH4>{t('device-farm:deviceDetailNameTitle')}</StyledH4>
          <FlexBox>
            <p>{device?.name}</p>
          </FlexBox>
        </Content>
        {!isGlobal && (
          <Content>
            <StyledH4>{t('device-farm:deviceDetailProjectTitle')}</StyledH4>
            <div>
              {device?.projects?.map((item) => (
                <Tag key={item.projectId}>{item.name}</Tag>
              ))}
            </div>
          </Content>
        )}
        <Content>
          <StyledH4>{t('device-farm:deviceDetailTagTitle')}</StyledH4>
          <div>
            {device?.deviceTags?.map((item) => (
              <Tag key={item.deviceTagId}>{item.name}</Tag>
            ))}
          </div>
        </Content>
        <Content>
          <StyledH4>{t('device-farm:deviceDetailConnectedHostTitle')}</StyledH4>
          <p>{device?.host?.name}</p>
        </Content>
        <Content>
          <StyledH4>{t('device-farm:deviceDetailCreatedAtTitle')}</StyledH4>
          <p>{getLocaleFormattedDate(lang, new Date(device?.createdAt ?? 0))}</p>
        </Content>
        <Content>
          <StyledH4>{t('device-farm:deviceDetailUpdatedAtTitle')}</StyledH4>
          <p>{getLocaleFormattedDate(lang, new Date(device?.updatedAt ?? 0))}</p>
        </Content>
      </Box>
    </Modal>
  );
};

export default DeviceDetailModal;

const Box = styled.div``;

const Content = styled.div`
  margin-bottom: 1.5rem;
`;

const FlexBox = styled.div`
  ${flexRowBaseStyle}
`;

const StyledH4 = styled.h4`
  margin-bottom: 0.2rem;
  font-size: 1.05rem;
  font-weight: 500;
`;
