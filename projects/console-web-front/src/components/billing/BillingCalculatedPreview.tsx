import {
  CallBillingApiResponse,
  GetBillingSubscriptionPreviewDto,
  GetBillingSubscriptionPreviewResponse,
} from '@dogu-private/console';
import { Button, Divider, Tag } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { planDescriptionInfoMap } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import { getLocaleFormattedDate, getLocaleFormattedPrice } from '../../utils/locale';
import ErrorBox from '../common/boxes/ErrorBox';
import BillingCouponInput from './BillingCouponInput';
import { swrAuthFetcher } from '../../api';
import { buildQueryPraramsByObject } from '../../utils/query';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {}

const BillingCalculatedPreview: React.FC<Props> = ({}) => {
  const cardForm = useBillingPlanPurchaseStore((state) => state.cardForm);
  const selectedPlan = useBillingPlanPurchaseStore((state) => state.selectedPlan);
  const isAnnual = useBillingPlanPurchaseStore((state) => state.isAnnual);
  const couponCode = useBillingPlanPurchaseStore((state) => state.coupon);
  const license = useBillingPlanPurchaseStore((state) => state.license);
  const router = useRouter();

  const dto: GetBillingSubscriptionPreviewDto = {
    organizationId: license?.organizationId ?? '',
    category: 'cloud',
    period: isAnnual ? 'yearly' : 'monthly',
    type: selectedPlan?.planType ?? 'live-testing',
    option: selectedPlan?.option ?? 1,
    currency: 'KRW',
    couponCode: couponCode ?? undefined,
  };
  const { data, isLoading } = useSWR<CallBillingApiResponse<GetBillingSubscriptionPreviewResponse>>(
    !!license && selectedPlan && `/billing/purchase/preview?${buildQueryPraramsByObject(dto, { removeFalsy: true })}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
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

  if (!data?.body?.ok || data?.errorMessage) {
    return <ErrorBox title="Oops" desc={data?.errorMessage ?? 'Failed to get preview'} />;
  }

  const planDescription = planDescriptionInfoMap[selectedPlan?.planType];
  const isAnnualSubscription = data.body.subscriptionPlan.period === 'yearly';
  const originPricePerMonth = isAnnualSubscription
    ? data.body.subscriptionPlan.originPrice / 12
    : data.body.subscriptionPlan.originPrice;

  return (
    <Box>
      {isLoading && (
        <LoadingWrapper style={{ height: '500px' }}>
          <LoadingOutlined />
        </LoadingWrapper>
      )}

      <Content>
        <div>
          <Tag color="success">New</Tag>
          <PlanTitle>{t(planDescription.titleI18nKey)}</PlanTitle>
          <div>
            <MonthlyPrice>{getLocaleFormattedPrice('ko', originPricePerMonth)}</MonthlyPrice>
            <PerMonthText> / {t('perMonthText')}</PerMonthText>
          </div>
          <OptionDescription>
            {isAnnualSubscription ? `${t('billedAnnuallyText')} | ` : ''}
            {t(planDescription.getOptionLabelI18nKey(data.body.subscriptionPlan.option), {
              option: data.body.subscriptionPlan.option,
            })}
          </OptionDescription>

          <div style={{ marginTop: '.25rem' }}>
            <CalculatedPriceContent>
              <span>
                {getLocaleFormattedPrice('ko', originPricePerMonth)} *{' '}
                {isAnnualSubscription ? t('monthCountPlural', { month: 12 }) : t('monthCountSingular', { month: 1 })}
              </span>
              <b>{getLocaleFormattedPrice('ko', originPricePerMonth * (isAnnualSubscription ? 12 : 1))}</b>
            </CalculatedPriceContent>
          </div>
        </div>

        {(data.body.elapsedPlans.length > 0 || data.body.remainingPlans.length > 0) && (
          <div style={{ margin: '.5rem 0' }}>
            <CalculatedPriceContent>
              <span>{t('subscriptionAdjustmentTitle')}</span>
              <b className="minus">{getLocaleFormattedPrice('ko', -400)}</b>
            </CalculatedPriceContent>

            {/* elapsed */}
            {data.body.elapsedPlans.length > 0 && (
              <div style={{ marginTop: '.25rem' }}>
                <p style={{ fontWeight: '500', color: '#888' }}>{t('refundElapsedTitle')}</p>

                {data.body.elapsedPlans.map((plan) => {
                  return (
                    <div key={plan.type} style={{ fontSize: '.8rem', marginBottom: '.25rem' }}>
                      <CalculatedPriceContent style={{ fontSize: '.85rem' }}>
                        <p style={{ fontWeight: '500' }}>{t(planDescriptionInfoMap[plan.type].titleI18nKey)}</p>
                        <b className="minus">{getLocaleFormattedPrice('ko', -200)}</b>
                      </CalculatedPriceContent>
                      <OptionDescription style={{ fontSize: '.75rem' }}>
                        {plan.period === 'yearly' ? `${t('billedAnnuallyText')} | ` : ''}
                        {t(planDescriptionInfoMap[plan.type].getOptionLabelI18nKey(plan.option), {
                          option: plan.option,
                        })}
                      </OptionDescription>
                    </div>
                  );
                })}
              </div>
            )}

            {/* remaining */}
            {data.body.remainingPlans.length > 0 && (
              <div style={{ marginTop: '.25rem' }}>
                <p style={{ fontWeight: '500', color: '#888' }}>{t('refundRemainingTitle')}</p>

                {data.body.remainingPlans.map((plan) => {
                  return (
                    <div key={plan.type} style={{ fontSize: '.8rem', marginBottom: '.25rem' }}>
                      <CalculatedPriceContent style={{ fontSize: '.85rem' }}>
                        <p style={{ fontWeight: '500' }}>{t(planDescriptionInfoMap[plan.type].titleI18nKey)}</p>
                        <b className="minus">{getLocaleFormattedPrice('ko', -200)}</b>
                      </CalculatedPriceContent>
                      <OptionDescription style={{ fontSize: '.75rem' }}>
                        {plan.period === 'yearly' ? `${t('billedAnnuallyText')} | ` : ''}
                        {t(planDescriptionInfoMap[plan.type].getOptionLabelI18nKey(plan.option), {
                          option: plan.option,
                        })}
                      </OptionDescription>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!!data.body.coupon && (
          <div style={{ marginTop: '.5rem' }}>
            <CalculatedPriceContent>
              <span>{t('couponLabelText')}</span>
              <b className="minus">{getLocaleFormattedPrice('ko', -data.body.coupon.discountedAmount)}</b>
            </CalculatedPriceContent>
            <OptionDescription style={{ fontSize: '.75rem' }}>
              {isAnnualSubscription
                ? t(
                    data.body.coupon.yearlyApplyCount ?? 1 > 1
                      ? 'couponOptionYearPluralText'
                      : 'couponOptionYearSingularText',
                    { year: data.body.coupon.yearlyApplyCount ?? 1, discount: data.body.coupon.yearlyDiscountPercent },
                  )
                : t(
                    data.body.coupon.monthlyApplyCount ?? 1 > 1
                      ? 'couponOptionMonthPluralText'
                      : 'couponOptionMonthSingularText',
                    {
                      month: data.body.coupon.monthlyApplyCount ?? 1,
                      discount: data.body.coupon.monthlyDiscountPercent,
                    },
                  )}
            </OptionDescription>
          </div>
        )}

        <div style={{ marginTop: '.5rem' }}>
          <CalculatedPriceContent>
            <span>{t('taxLabelText')}</span>
            <b>{data.body.tax}</b>
          </CalculatedPriceContent>
        </div>

        <Divider style={{ margin: '.5rem 0', borderTopWidth: '2px' }} />

        <div>
          <CalculatedPriceContent>
            <TotalText>{t('totalLabelText')}</TotalText>
            <TotalText>{getLocaleFormattedPrice('ko', data.body.totalPrice)}</TotalText>
          </CalculatedPriceContent>
        </div>

        {data.body.nextPurchaseTotalPrice !== data.body.totalPrice && (
          <div style={{ marginTop: '.5rem' }}>
            <NextBillingText>
              {t('nextPurchaseDescriptionText', {
                date: getLocaleFormattedDate(router.locale, new Date(data.body.nextPurchasedAt), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
                price: getLocaleFormattedPrice('ko', data.body.nextPurchaseTotalPrice),
                period: isAnnual ? 'year' : 'month',
              })}
            </NextBillingText>
          </div>
        )}
      </Content>
      <Content>
        <BillingCouponInput />
      </Content>
      <Button type="primary" onClick={handlePurchase} style={{ width: '100%' }} loading={isLoading}>
        {t('purchaseButtonText')}
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
  position: relative;
  flex: 1;
  background-color: ${(props) => props.theme.colorPrimary}22;
  border-radius: 0.5rem;
  padding: 0.75rem;
  flex-shrink: 0;
  min-height: 400px;
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

const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;
