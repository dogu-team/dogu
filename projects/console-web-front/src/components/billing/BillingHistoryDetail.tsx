import { BillingHistoryBase } from '@dogu-private/console';
import { Divider } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { planDescriptionInfoMap } from '../../resources/plan';
import { flexRowSpaceBetweenStyle } from '../../styles/box';
import { getHistoryAmount } from '../../utils/billing';
import { getLocaleFormattedDate, getLocaleFormattedPrice } from '../../utils/locale';
import ErrorBox from '../common/boxes/ErrorBox';

interface Props {
  history: BillingHistoryBase;
}

const BillingHistoryDetail: React.FC<Props> = ({ history }) => {
  const router = useRouter();
  const { t } = useTranslation('billing');

  if (!history.billingSubscriptionPlanHistories) {
    return <ErrorBox title="Something went wrong" desc="No details for invoice" />;
  }

  return (
    <Box>
      <DetailInfo>
        <span>{t('historyDetailPurchaseIdText')}</span>
        {history.billingHistoryId}
      </DetailInfo>
      <DetailInfo>
        <span>{t('historyDetailPurchaseDateText')}</span>
        {getLocaleFormattedDate(router.locale, new Date(history.createdAt), {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </DetailInfo>
      <DetailInfo>
        <span>{t('historyDetailPaymentText')}</span>
        <label style={{ verticalAlign: 'sub' }}>**** **** **** </label>
        {history.cardNumberLast4Digits} {`(${history.cardName?.replace(/\[|\]/g, '')})`}
      </DetailInfo>

      <Divider style={{ margin: '.5rem 0' }} />

      <div>
        {history.billingSubscriptionPlanHistories.map((planHistory) => {
          const descriptionInfo = planDescriptionInfoMap[planHistory.type];

          return (
            <div key={planHistory.billingSubscriptionPlanHistoryId} style={{ margin: '.25rem 0' }}>
              <FlexSpaceBetween>
                <b style={{ fontWeight: '600' }}>{t(descriptionInfo.titleI18nKey)}</b>
                <b style={{ fontWeight: '600' }}>
                  {getLocaleFormattedPrice(router.locale, planHistory.currency, getHistoryAmount(planHistory))}
                </b>
              </FlexSpaceBetween>
              <OptionText>
                {t(descriptionInfo.getOptionLabelI18nKey(planHistory.option), { option: planHistory.option })} /{' '}
                {t(planHistory.period === 'yearly' ? 'monthCountPlural' : 'monthCountSingular', {
                  month: planHistory.period === 'yearly' ? 12 : 1,
                })}
              </OptionText>
            </div>
          );
        })}
      </div>

      <Divider style={{ margin: '.5rem 0' }} />

      <FlexSpaceBetween style={{ fontSize: '1rem', fontWeight: '600' }}>
        <span>{t('historyDetailTotalAmountText')}</span>
        <span>{getLocaleFormattedPrice(router.locale, history.currency, getHistoryAmount(history))}</span>
      </FlexSpaceBetween>
    </Box>
  );
};

export default BillingHistoryDetail;

const Box = styled.div`
  background-color: ${(props) => props.theme.colorPrimary}22;
  padding: 1rem;
  border-radius: 0.5rem;
`;

const DetailInfo = styled.div`
  margin-bottom: 0.25rem;

  span {
    display: inline-block;
    width: 7rem;
  }
`;

const FlexSpaceBetween = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const OptionText = styled.p`
  font-size: 0.8rem;
  color: #999;
`;
