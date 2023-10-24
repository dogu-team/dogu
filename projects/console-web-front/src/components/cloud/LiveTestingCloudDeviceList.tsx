import { CloudDeviceMetadataBase, ceilDeviceMemory } from '@dogu-private/console';
import { List, Modal } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Image from 'next/image';
import { shallow } from 'zustand/shallow';
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';

import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { deviceBrandMapper } from '../../resources/device/brand';
import useRefresh from '../../hooks/useRefresh';
import useModal from '../../hooks/useModal';
import PlatformIcon from '../device/PlatformIcon';
import CloudDeviceVersionList from './CloudDeviceSelectList';
import useCloudDeviceFilterStore from '../../stores/cloud-device-filter';
import useEventStore from '../../stores/events';
import usePaginationSWR from '../../hooks/usePaginationSWR';
import LiveTestingStartButton from './LiveTestingStartButton';

const DeviceItem: React.FC<{ device: CloudDeviceMetadataBase }> = ({ device }) => {
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation('cloud-device');

  useEffect(() => {
    useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onCloudLiveTestingSessionCreated') {
        closeModal();
      }
    });
  }, [closeModal]);

  return (
    <>
      <Item>
        <ItemInner>
          <OneSpan>{deviceBrandMapper[device.manufacturer] ?? device.manufacturer}</OneSpan>
          <OneSpan>{device.modelName ?? device.model}</OneSpan>
          <OneSpan>
            <PlatformIcon platform={device.platform} />
          </OneSpan>
          <OneSpan>
            {device.resolutionHeight} * {device.resolutionWidth}
          </OneSpan>
          <OneSpan>{Number(device.memory) ? `${ceilDeviceMemory(Number(device.memory))}` : '-'}</OneSpan>
          <ButtonWrapper>
            <LiveTestingStartButton device={device} onClick={() => openModal()} />
          </ButtonWrapper>
        </ItemInner>
      </Item>

      <Modal
        open={isOpen}
        closable
        onCancel={closeModal}
        footer={null}
        centered
        destroyOnClose
        title={t('cloudDeviceSelectModalTitle')}
      >
        <DeviceInfoWrapper>
          <div>
            <Image
              src={`https://s3.ap-northeast-2.amazonaws.com/public.dogutech.io/dogu/device/${device.model}.png`}
              width={120}
              height={120}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              alt={device.modelName ?? device.model}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div style={{ marginLeft: '.5rem' }}>
            <DeviceName>{device.modelName}</DeviceName>
            <DeviceModel>{`${device.model}`}</DeviceModel>
          </div>
        </DeviceInfoWrapper>
        <CloudDeviceVersionList device={device} />
      </Modal>
    </>
  );
};

interface Props {}

const LiveTestingCloudDeviceList: React.FC<Props> = () => {
  const router = useRouter();
  const { keyword, platform, version } = useCloudDeviceFilterStore((state) => state.filterValue, shallow);
  const { data, error, isLoading, mutate, page, updatePage } = usePaginationSWR<CloudDeviceMetadataBase>(
    `/cloud-devices?keyword=${keyword}${platform ? `&platform=${platform}` : ''}&version=${version}`,
    { skipQuestionMark: true, offset: 12 },
    { keepPreviousData: true, refreshInterval: 10000 },
  );
  const { t } = useTranslation('cloud-device');

  useRefresh(['onRefreshClicked'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <OneSpan>{t('cloudDeviceListBrandColumn')}</OneSpan>
          <OneSpan>{t('cloudDeviceListNameColumn')}</OneSpan>
          <OneSpan>{t('cloudDeviceListPlatformColumn')}</OneSpan>
          <OneSpan>{t('cloudDeviceListScreenColumn')}</OneSpan>
          <OneSpan>{t('cloudDeviceListMemoryColumn')}</OneSpan>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List<CloudDeviceMetadataBase>
        loading={isLoading}
        dataSource={data?.items}
        renderItem={(device) => <DeviceItem device={device} />}
        rowKey={(device) => device.model}
        pagination={{
          current: page,
          pageSize: 12,
          total: data?.totalCount,
          onChange: (page) => {
            updatePage(page);
          },
        }}
      />
    </>
  );
};

export default LiveTestingCloudDeviceList;

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
  ${tableCellStyle}
  flex: 1;
`;

const ButtonWrapper = styled.div`
  width: 100px;
  display: flex;
  justify-content: flex-end;
`;

const DeviceInfoWrapper = styled.div`
  ${flexRowBaseStyle}
  margin-bottom: 1rem;
`;

const DeviceName = styled.b`
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.5;
`;

const DeviceModel = styled.div`
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.5;
  color: #999;
`;
