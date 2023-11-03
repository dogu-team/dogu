import { CallBillingApiResponse, GetBillingSubscriptionPreviewDto } from '@dogu-private/console';
import { Button, Divider, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';
import styled from 'styled-components';

import { planDescriptionInfoMap } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import { getLocaleFormattedPrice } from '../../utils/locale';
import ErrorBox from '../common/boxes/ErrorBox';
import BillingCouponInput from './BillingCouponInput';
import { swrAuthFetcher } from '../../api';
import { buildQueryPraramsByObject } from '../../utils/query';

interface Props {}

const BillingCalculatedPreview: React.FC<Props> = ({}) => {
  const cardForm = useBillingPlanPurchaseStore((state) => state.cardForm);
  const selectedPlan = useBillingPlanPurchaseStore((state) => state.selectedPlan);
  const isAnnual = useBillingPlanPurchaseStore((state) => state.isAnnual);
  const couponCode = useBillingPlanPurchaseStore((state) => state.coupon);
  const license = useBillingPlanPurchaseStore((state) => state.license);

  const dto: GetBillingSubscriptionPreviewDto = {
    organizationId: license?.organizationId ?? '',
    category: 'cloud',
    period: isAnnual ? 'yearly' : 'monthly',
    type: selectedPlan?.planType ?? 'live-testing',
    option: selectedPlan?.option ?? 1,
    currency: 'KRW',
    couponCode: couponCode ?? undefined,
  };
  const { data, isLoading } = useSWR<CallBillingApiResponse>(
    !!license && selectedPlan && `/billing/purchase/preview?${buildQueryPraramsByObject(dto)}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const { t } = useTranslation('billing');

  const handlePurchase = async () => {
    if (!cardForm) {
      return;
    }
    const values = await cardForm.validateFields();
    console.log(values);
  };

  if (!selectedPlan) {
    return <ErrorBox title="Oops" desc="Plan not selected" />;
  }

  const planDescription = planDescriptionInfoMap[selectedPlan?.planType];

  return (
    <Box>
      <Content>
        <div>
          <Tag color="success">New</Tag>
          <PlanTitle>{t(planDescription.titleI18nKey)}</PlanTitle>
          <div>
            <MonthlyPrice>{getLocaleFormattedPrice('ko', 31000)}</MonthlyPrice>
            <PerMonthText> / month</PerMonthText>
          </div>
          <OptionDescription>
            {isAnnual ? 'Billed annually | ' : ''}
            {t(planDescription.getOptionLabelI18nKey(selectedPlan.option), { option: selectedPlan.option })}
          </OptionDescription>

          <div style={{ marginTop: '.25rem' }}>
            <CalculatedPriceContent>
              <span>
                {getLocaleFormattedPrice('ko', 31000)} * {isAnnual ? '12' : '1'} month
              </span>
              <b>{getLocaleFormattedPrice('ko', 31000 * (isAnnual ? 12 : 1))}</b>
            </CalculatedPriceContent>
          </div>
        </div>

        <div style={{ margin: '.5rem 0' }}>
          <CalculatedPriceContent>
            <span>요금 조정</span>
            <b className="minus">{getLocaleFormattedPrice('ko', -400)}</b>
          </CalculatedPriceContent>

          {/* elapsed */}
          <div style={{ marginTop: '.25rem' }}>
            <p style={{ fontWeight: '500', color: '#888' }}>사용하지 않은 기간에 대한 환불</p>

            <div style={{ fontSize: '.8rem', marginBottom: '.25rem' }}>
              <CalculatedPriceContent style={{ fontSize: '.85rem' }}>
                <p style={{ fontWeight: '500' }}>Live testing</p>
                <b className="minus">{getLocaleFormattedPrice('ko', -200)}</b>
              </CalculatedPriceContent>
              <OptionDescription style={{ fontSize: '.75rem' }}>Billed annually | 1 parallel session</OptionDescription>
            </div>
          </div>

          {/* remaining */}
          <div style={{ marginTop: '.25rem' }}>
            <p style={{ fontWeight: '500', color: '#888' }}>현재 플랜 미사용 기간에 대한 환불</p>

            <div style={{ fontSize: '.8rem', marginBottom: '.25rem' }}>
              <CalculatedPriceContent style={{ fontSize: '.85rem' }}>
                <p style={{ fontWeight: '500' }}>Live testing</p>
                <b className="minus">{getLocaleFormattedPrice('ko', -200)}</b>
              </CalculatedPriceContent>
              <OptionDescription style={{ fontSize: '.75rem' }}>Billed annually | 1 parallel session</OptionDescription>
            </div>
          </div>
        </div>

        <div>
          <CalculatedPriceContent>
            <span>Tax</span>
            <b>0</b>
          </CalculatedPriceContent>
        </div>

        <Divider style={{ margin: '.5rem 0', borderTopWidth: '2px' }} />

        <div>
          <CalculatedPriceContent>
            <TotalText>Total</TotalText>
            <TotalText>{getLocaleFormattedPrice('ko', 31000 * (isAnnual ? 12 : 1))}</TotalText>
          </CalculatedPriceContent>
        </div>

        <div style={{ marginTop: '.5rem' }}>
          <NextBillingText>
            From 16th Oct, 2024 you will be charged $468/year for full 365 days of subscription
          </NextBillingText>
        </div>
      </Content>

      <Content>
        <BillingCouponInput />
      </Content>

      <Button type="primary" onClick={handlePurchase} style={{ width: '100%' }}>
        Purchase
      </Button>
      <div style={{ marginTop: '.2rem' }}>
        <Agreement>
          By purchasing plan you agree to our <a target="_blank">Terms and Conditions</a> and auto renewal
        </Agreement>
      </div>
    </Box>
  );
};

export default BillingCalculatedPreview;

const Box = styled.div`
  flex: 1;
  background-color: ${(props) => props.theme.colorPrimary}22;
  border-radius: 0.5rem;
  padding: 0.75rem;
  flex-shrink: 0;
`;

const Content = styled.div`
  margin-bottom: 1rem;
`;

const PlanTitle = styled.p`
  margin-bottom: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
`;

const OptionDescription = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.main.colors.gray3};
`;

const MonthlyPrice = styled.b`
  font-size: 1.25rem;
  font-weight: 600;
`;

const PerMonthText = styled.span`
  font-size: 0.8rem;
  color: ${(props) => props.theme.main.colors.gray4};
`;

const CalculatedPriceContent = styled.div`
  font-size: 1rem;
  display: flex;
  justify-content: space-between;

  b {
    font-weight: 600;
  }

  b.minus {
    color: ${(props) => props.theme.colorPrimary};
  }
`;

const TotalText = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
`;

const Agreement = styled.p`
  font-size: 0.7rem;
  color: ${(props) => props.theme.main.colors.gray3};
  line-height: 1.3;
`;

const NextBillingText = styled.p`
  font-size: 0.75rem;
  color: ${(props) => props.theme.main.colors.gray3};
  line-height: 1.3;
`;
