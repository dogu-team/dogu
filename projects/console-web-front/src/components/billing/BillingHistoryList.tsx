import { BillingHistoryBase, CallBillingApiResponse, GetBillingHistoriesDto, PageBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Button, List } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useRefresh from '../../hooks/useRefresh';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { getLocaleFormattedDate } from '../../utils/locale';
import { buildQueryPraramsByObject } from '../../utils/query';

interface ItemProps {
  history: BillingHistoryBase;
}

const HistoryItem: React.FC<ItemProps> = ({ history }) => {
  const router = useRouter();

  return (
    <Item>
      <ItemInner>
        <Cell flex={1}>
          {getLocaleFormattedDate(router.locale ?? 'en', new Date(history.purchasedAt), {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })}
        </Cell>
        <Cell flex={2}></Cell>
        <Cell flex={1}></Cell>
        <ButtonWrapper>
          <Button type="link">See more</Button>
        </ButtonWrapper>
      </ItemInner>
    </Item>
  );
};

interface Props {
  organizationId: OrganizationId;
}

const BillingHistoryList: React.FC<Props> = ({ organizationId }) => {
  const [page, setPage] = useState(1);
  const queryDto: GetBillingHistoriesDto = {
    organizationId,
    page,
    offset: 10,
  };
  const { data, isLoading, mutate } = useSWR<CallBillingApiResponse<PageBase<BillingHistoryBase>>>(
    `/billing/histories?${buildQueryPraramsByObject(queryDto)}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  useRefresh(['onPurchaseCompleted'], () => mutate());

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
      <List<BillingHistoryBase>
        dataSource={data?.body?.items}
        renderItem={(item) => <HistoryItem history={item} />}
        loading={isLoading}
        pagination={{
          defaultCurrent: 1,
          pageSize: 10,
          current: page || 1,
          onChange: (p) => {
            setPage(p);
          },
          total: data?.body?.totalCount,
        }}
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
  width: 100px;
  display: flex;
  justify-content: flex-end;
`;
