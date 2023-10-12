import { CloudDeviceMetadataBase, CloudDeviceByModelResponse, DeviceUsageState } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import useSWR from 'swr';
import styled from 'styled-components';
import { List, Button } from 'antd';

import { swrAuthFetcher } from '../../api/index';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import PlatformIcon from '../device/PlatformIcon';

const SelectItem: React.FC<{ item: CloudDeviceByModelResponse; platform: Platform }> = ({ item, platform }) => {
  return (
    <Item>
      <ItemInner>
        <OneSpan>
          <PlatformIcon platform={platform} />
          &nbsp;{item.version}
        </OneSpan>
        <ButtonWrapper>
          <Button type="primary" disabled={item.usageState !== DeviceUsageState.AVAILABLE}>
            Start
          </Button>
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

  return (
    <>
      <Header>
        <OneSpan>Version</OneSpan>
        <ButtonWrapper />
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
