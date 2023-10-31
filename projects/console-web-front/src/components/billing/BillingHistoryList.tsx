import { List } from 'antd';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';

interface ItemProps {
  item: any;
}

const BillingHistoryItem: React.FC<ItemProps> = ({ item }) => {
  return (
    <Item>
      <ItemInner>
        <Cell flex={1}>{item.date.toISOString()}</Cell>
        <Cell flex={2}>{item.items.join(',')}</Cell>
        <Cell flex={1}>{item.amount}</Cell>
        <ButtonWrapper />
      </ItemInner>
    </Item>
  );
};

interface Props {}

const BillingHistoryList: React.FC = () => {
  const { data } = useSWR(`/billing/history`, swrAuthFetcher, { revalidateOnFocus: false });

  return (
    <>
      <Header>
        <ItemInner>
          <Cell flex={1}>Date</Cell>
          <Cell flex={2}>Items</Cell>
          <Cell flex={1}>Amount</Cell>
          <ButtonWrapper />
        </ItemInner>
      </Header>
      <List
        dataSource={[{ date: new Date(), items: ['test1', 'test2'], amount: '85$' }]}
        renderItem={(item) => <BillingHistoryItem item={item} />}
      />
    </>
  );
};

export default BillingHistoryList;

const Item = styled(List.Item)`
  ${listItemStyle}
`;

const Header = styled.div`
  ${tableHeaderStyle}
`;

const ItemInner = styled.div`
  ${flexRowBaseStyle}
`;

const Cell = styled.div<{ flex: number }>`
  ${tableCellStyle}
  flex: ${(props) => props.flex};
`;

const ButtonWrapper = styled.div`
  width: 60px;
  display: flex;
  justify-content: flex-end;
`;
