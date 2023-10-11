import { CloudDeviceMetadataBase, DeviceUsageState, PageBase, ceilDeviceMemory } from '@dogu-private/console';
import { List, Button, Modal } from 'antd';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import styled from 'styled-components';
import Image from 'next/image';
import { shallow } from 'zustand/shallow';

import { swrAuthFetcher } from '../../api';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { deviceBrandMapper } from '../../resources/device/brand';
import useRefresh from '../../hooks/useRefresh';
import useModal from '../../hooks/useModal';
import PlatformIcon from '../device/PlatformIcon';
import CloudDeviceVersionList from './CloudDeviceSelectList';
import useCloudDeviceFilterStore from '../../stores/cloud-device-filter';

const DeviceItem: React.FC<{ device: CloudDeviceMetadataBase }> = ({ device }) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Item>
        <ItemInner>
          <OneSpan>{deviceBrandMapper[device.manufacturer] ?? device.manufacturer}</OneSpan>
          <OneSpan>{device.modelName}</OneSpan>
          <OneSpan>
            <PlatformIcon platform={device.platform} />
          </OneSpan>
          <OneSpan>
            {device.resolutionWidth} * {device.resolutionHeight}
          </OneSpan>
          <OneSpan>{Number(device.memory) ? `${ceilDeviceMemory(Number(device.memory))}` : '-'}</OneSpan>
          <ButtonWrapper>
            <Button
              type="primary"
              onClick={() => openModal()}
              disabled={device.usageState !== DeviceUsageState.available}
            >
              Start
            </Button>
          </ButtonWrapper>
        </ItemInner>
      </Item>

      <Modal open={isOpen} closable onCancel={closeModal} footer={null} centered destroyOnClose title="Select version">
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
  const { keyword } = useCloudDeviceFilterStore((state) => state.filterValue, shallow);
  console.log(keyword);
  const { data, error, isLoading, mutate } = useSWR<PageBase<CloudDeviceMetadataBase>>(
    `/cloud-devices?page=${Number(router.query.page) || 1}&keyword=${keyword}`,
    swrAuthFetcher,
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  useRefresh(['onRefreshClicked'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <OneSpan>Brand</OneSpan>
          <OneSpan>Name</OneSpan>
          <OneSpan>Platform</OneSpan>
          <OneSpan>Screen</OneSpan>
          <OneSpan>Memory</OneSpan>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List<CloudDeviceMetadataBase>
        loading={isLoading}
        dataSource={data?.items}
        renderItem={(device) => <DeviceItem device={device} />}
        rowKey={(device) => device.model}
        pagination={{
          current: data?.page,
          pageSize: 10,
          total: data?.totalCount,
          onChange: (page) => {
            router.push({ query: { page } });
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
  width: 80px;
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
