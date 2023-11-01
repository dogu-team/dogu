import { DownloadOutlined } from '@ant-design/icons';
import { Button, List } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api/index';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { getLocaleFormattedDate } from '../../utils/locale';

interface ItemProps {
  item: any;
}

const InvoiceItem: React.FC<ItemProps> = ({ item }) => {
  const router = useRouter();

  return (
    <Item>
      <ItemInner>
        <Cell flex={1}>
          {getLocaleFormattedDate(router.locale ?? 'en', item.date, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Cell>
        <Cell flex={2}>{item.items.join(',')}</Cell>
        <Cell flex={1}>{item.amount}</Cell>
        <ButtonWrapper>
          <Button type="link">See more</Button>
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {}

const BillingInvoiceList: React.FC = () => {
  const { data } = useSWR(`/billing/invoices`, swrAuthFetcher, { revalidateOnFocus: false });

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
        renderItem={(item) => <InvoiceItem item={item} />}
      />
    </>
  );
};

export default BillingInvoiceList;

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
  width: 100px;
  display: flex;
  justify-content: flex-end;
`;
