import { CloudDeviceMetadataBase, CloudDeviceByModelResponse } from '@dogu-private/console';
import { OrganizationId, Platform } from '@dogu-private/types';
import useSWR from 'swr';
import styled from 'styled-components';
import { List } from 'antd';
import { useRouter } from 'next/router';
import { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';
import useTranslation from 'next-translate/useTranslation';

import { swrAuthFetcher } from '../../api/index';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import PlatformIcon from '../device/PlatformIcon';
import { sendErrorNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import { createLiveTestingSession } from '../../api/live-session';
import useEventStore from '../../stores/events';
import LiveTestingStartButton from './LiveTestingStartButton';

const SelectItem: React.FC<{ item: CloudDeviceByModelResponse; platform: Platform }> = ({ item, platform }) => {
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);
  const router = useRouter();

  const organizationId = router.query.orgId as OrganizationId;

  const handleStart = async () => {
    try {
      const session = await createLiveTestingSession({
        organizationId,
        deviceModel: item.model,
        deviceVersion: item.version,
      });
      fireEvent('onCloudLiveTestingSessionCreated', session);
      window.open(
        `${location.origin}/${router.locale}/dashboard/${organizationId}/live-testing/${session.liveSessionId}/${session.deviceId}`,
        '_blank',
      );
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Cannot start device: ${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  return (
    <Item>
      <ItemInner>
        <OneSpan>
          <PlatformIcon platform={platform} />
          &nbsp;{item.version}
        </OneSpan>
        <OneSpan>Korea</OneSpan>
        <ButtonWrapper>
          <LiveTestingStartButton device={item} onClick={handleStart} />
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {
  device: CloudDeviceMetadataBase;
}

const CloudDeviceVersionList: React.FC<Props> = ({ device }) => {
  const { data, isLoading, error } = useSWR<CloudDeviceByModelResponse[]>(
    `/cloud-devices/${device.model}/versions`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const { t } = useTranslation('cloud-device');

  return (
    <>
      <Header>
        <ItemInner>
          <OneSpan>{t('cloudDeviceSelectListVersionColumn')}</OneSpan>
          <OneSpan>{t('cloudDeviceSelectListLocationColumn')}</OneSpan>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List<CloudDeviceByModelResponse>
        dataSource={data}
        loading={isLoading}
        renderItem={(item) => <SelectItem item={item} platform={device.platform} />}
        rowKey={(item) => item.version}
      />
    </>
  );
};

export default CloudDeviceVersionList;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const OneSpan = styled.div`
  display: flex;
  ${tableCellStyle}
  flex: 1;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  width: 80px;
  display: flex;
  justify-content: flex-end;
`;
