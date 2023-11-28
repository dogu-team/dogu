import { BillingHistoryBase, CallBillingApiResponse, GetBillingHistoriesDto, PageBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Button, List, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useModal from '../../hooks/useModal';
import useRefresh from '../../hooks/useRefresh';
import { planDescriptionInfoMap } from '../../resources/plan';
import { flexRowBaseStyle, listItemStyle, tableCellStyle, tableHeaderStyle } from '../../styles/box';
import { getHistoryAmount } from '../../utils/billing';
import { getLocaleFormattedDate, getLocaleFormattedPrice } from '../../utils/locale';
import { buildQueryPraramsByObject } from '../../utils/query';
import BillingHistoryDetail from './BillingHistoryDetail';

interface ItemProps {
  history: BillingHistoryBase;
}

const HistoryItem: React.FC<ItemProps> = ({ history }) => {
  const router = useRouter();
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation('billing');

  return (
    <Item>
      <ItemInner>
        <Cell flex={1}>
          {getLocaleFormattedDate(router.locale ?? 'en', new Date(history.createdAt), {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })}
        </Cell>
        <Cell flex={2}>
          {history.billingPlanHistories?.map((item) => {
            const isAnnual = item.period === 'yearly';
            const descriptionInfo = planDescriptionInfoMap[item.type];

            return (
              <HistoryItemWrapper key={item.billingPlanHistoryId}>
                <b>{t(descriptionInfo.titleI18nKey)}</b>
                <span>
                  {`(${t(descriptionInfo.getOptionLabelI18nKey(item.option), {
                    option: item.option,
                  })})`}
                </span>{' '}
                / {t(isAnnual ? 'monthCountPlural' : 'monthCountSingular', { month: isAnnual ? 12 : 1 })}
              </HistoryItemWrapper>
            );
          })}
        </Cell>
        <Cell flex={1}>{getLocaleFormattedPrice('ko', 'KRW', getHistoryAmount(history))}</Cell>
        <ButtonWrapper>
          <Button type="link" onClick={() => openModal()}>
            {t('historySeeDetailButtonText')}
          </Button>
        </ButtonWrapper>
      </ItemInner>

      <Modal
        title={t('historyDetailModalTitle')}
        open={isOpen}
        destroyOnClose
        centered
        footer={null}
        closable
        onCancel={closeModal}
      >
        <BillingHistoryDetail history={history} />
      </Modal>
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
  const { t } = useTranslation('billing');

  useRefresh(['onPurchaseCompleted'], () => mutate());

  return (
    <>
      <Header>
        <ItemInner>
          <Cell flex={1}>{t('historyDateColumnText')}</Cell>
          <Cell flex={2}>{t('historyItemColumnText')}</Cell>
          <Cell flex={1}>{t('historyAmountColumnText')}</Cell>
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

const HistoryItemWrapper = styled.div`
  line-height: 1.5;

  span {
    margin-left: 0.25rem;
    color: ${(props) => props.theme.main.colors.gray3};
  }
`;
