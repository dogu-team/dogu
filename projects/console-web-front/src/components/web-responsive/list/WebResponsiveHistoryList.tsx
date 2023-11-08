import { CloudDeviceMetadataBase, ceilDeviceMemory } from '@dogu-private/console';
import { List, Modal } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Image from 'next/image';
import { shallow } from 'zustand/shallow';
import { useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';

import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../../styles/box';
import useRefresh from '../../../hooks/useRefresh';
import useCloudDeviceFilterStore from '../../../stores/cloud-device-filter';
import usePaginationSWR from '../../../hooks/usePaginationSWR';

const WebResponsiveHistory: React.FC<{ device: CloudDeviceMetadataBase }> = ({ device }) => {
  return null;
};

interface Props {}

const WebResponsiveHistoryList: React.FC<Props> = () => {
  const router = useRouter();
  const { keyword, platform, version } = useCloudDeviceFilterStore((state) => state.filterValue, shallow);
  const { data, error, isLoading, mutate, page, updatePage } = usePaginationSWR<CloudDeviceMetadataBase>(
    `/cloud-devices?keyword=${keyword}${platform ? `&platform=${platform}` : ''}&version=${version}`,
    { skipQuestionMark: true, offset: 12 },
    { keepPreviousData: true, refreshInterval: 10000 },
  );
  const { t } = useTranslation('web-responsive');

  useRefresh(['onRefreshClicked'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <OneSpan>{t('webResponsiveUrlColumn')}</OneSpan>
          <OneSpan>{t('webResponsiveVendorColumn')}</OneSpan>
          <OneSpan>{t('webResponsiveSanpshotCount')}</OneSpan>
          <OneSpan>{t('webResponsiveStateColumn')}</OneSpan>
          <OneSpan>{t('cloudDeviceListMemoryColumn')}</OneSpan>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      {/* <List<CloudDeviceMetadataBase>
        loading={isLoading}
        dataSource={data?.items}
        renderItem={(device) => <WebResponsiveHistory device={device} />}
        rowKey={(device) => device.model}
        pagination={{
          current: page,
          pageSize: 12,
          total: data?.totalCount,
          onChange: (page) => {
            updatePage(page);
          },
        }}
      /> */}
    </>
  );
};

export default WebResponsiveHistoryList;

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
