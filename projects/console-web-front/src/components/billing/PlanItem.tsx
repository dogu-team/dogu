import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  BillingCurrency,
  BillingPeriod,
  BillingPromotionCouponResponse,
  BillingPlanOptionInfo,
  BillingPlanType,
} from '@dogu-private/console';
import { Button, Divider, Select, SelectProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { precheckoutPurchase, usePromotionCouponSWR } from '../../api/billing';
import { PlanDescriptionInfo } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useLicenseStore from '../../stores/license';
import { getPaymentMethodFromLicense, getSubscriptionPlansFromLicense } from '../../utils/billing';
import { getLocaleFormattedPrice } from '../../utils/locale';
import usePaddle from '../../hooks/usePaddle';
import useAuthStore from '../../stores/auth';
import useRequest from '../../hooks/useRequest';
import { sendErrorNotification } from '../../utils/antd';

interface Props {
  planType: BillingPlanType;
  planInfo: BillingPlanOptionInfo;
  descriptionInfo: PlanDescriptionInfo;
}

const CONTACT_US_OPTION_KEY = 'contact-us';

const PlanItem: React.FC<Props> = ({ planType, planInfo, descriptionInfo }) => {
  const license = useLicenseStore((state) => state.license);
  const me = useAuthStore((state) => state.me);
  const [isAnnual, updateIsAnnual] = useBillingPlanPurchaseStore(
    (state) => [state.isAnnual, state.updateIsAnnual],
    shallow,
  );
  const updateSelectedPlan = useBillingPlanPurchaseStore((state) => state.updateSelectedPlan);
  const { data, isLoading } = usePromotionCouponSWR(true, {
    planType: planType,
    category: planInfo.category,
  });
  const router = useRouter();
  const { t } = useTranslation('billing');
  const { paddleRef, loading: paddleLoading } = usePaddle();
  const [precheckoutLoading, requestPrecheckoutPurchase] = useRequest(precheckoutPurchase);

  const currency: BillingCurrency = license
    ? getPaymentMethodFromLicense(router.locale, license) === 'nice'
      ? 'KRW'
      : 'USD'
    : router.locale === 'ko'
    ? 'KRW'
    : 'USD';
  const usingPlans = license ? getSubscriptionPlansFromLicense(license, [planType]) : [];
  const baseOptions: SelectProps<string | number>['options'] = Object.keys(planInfo.optionMap).map((optionKey) => {
    return {
      value: optionKey,
      label: t(descriptionInfo.getOptionLabelI18nKey(optionKey), { option: optionKey }),
    };
  });
  const options = descriptionInfo.lastContactUsOptionKey
    ? [
        ...baseOptions,
        { value: CONTACT_US_OPTION_KEY, label: t(descriptionInfo.lastContactUsOptionKey, { option: 25 }) },
      ]
    : baseOptions;

  const [selectedValue, setSelectedValue] = useState<string | number | null | undefined>(() => {
    return usingPlans?.[0]?.option ? `${usingPlans[0].option}` : options[0].value;
  });

  const handleChangeOption = (value: string | number) => {
    setSelectedValue(value);
  };

  const getButtonState = (): {
    text: string;
    disabled: boolean;
    shouldGoAnnual: boolean;
  } => {
    const period: BillingPeriod = isAnnual ? 'yearly' : 'monthly';
    const plan = usingPlans[0];

    if (plan && plan.option === Number(selectedValue) && isAnnual && plan.period === 'yearly') {
      return { text: t('currentPlanButtonTitle'), disabled: true, shouldGoAnnual: false };
    }

    if (plan && plan.option === Number(selectedValue) && plan.period === 'monthly') {
      // annual plan is not available
      // return { text: t('goAnnualButtonTitle'), disabled: false, shouldGoAnnual: true };
      return { text: t('currentPlanButtonTitle'), disabled: true, shouldGoAnnual: false };
    }

    if (
      !plan ||
      (plan &&
        (plan.period === period || (plan.period === 'monthly' && isAnnual)) &&
        plan.option < Number(selectedValue))
    ) {
      return { text: t('upgradeButtonTitle'), disabled: false, shouldGoAnnual: false };
    }

    return { text: t('changeButtonTitle'), disabled: false, shouldGoAnnual: false };
  };

  const { text: buttonText, disabled: buttonDisabled, shouldGoAnnual } = getButtonState();

  const handleClickButton = async () => {
    if (!license) {
      return;
    }
    const billingPlanSourceId = planInfo.optionMap[Number(selectedValue)][currency][isAnnual ? 'yearly' : 'monthly'].id;

    if (getPaymentMethodFromLicense(router.locale, license) === 'nice') {
      updateSelectedPlan({
        type: planType,
        option: Number(selectedValue) ?? 0,
        category: planInfo.category,
        billingPlanSourceId,
      });
      if (shouldGoAnnual) {
        // annual plan is not available for now
        // updateIsAnnual(true);
      }
    } else {
      if (!license || !me) {
        return;
      }

      try {
        const res = await requestPrecheckoutPurchase({
          organizationId: license.organizationId,
          billingPlanSourceId,
        });

        if (!res.body?.paddle) {
          sendErrorNotification('Failed to get purchase data. Please contact us.');
          return;
        }

        // TODO: add discount id from precheckout if promotion coupon is available
        paddleRef.current?.Checkout.open({
          settings: {
            allowLogout: false,
            displayMode: 'overlay',
            successUrl: `${window.location.origin}/billing/success`,
          },
          items: [
            {
              priceId: res.body.paddle.priceId,
            },
          ],
          customer: {
            id: res.body.paddle.customerId,
            address: res.body.paddle.addressId
              ? {
                  id: res.body.paddle.addressId,
                }
              : undefined,
            business: res.body.paddle.businessId
              ? {
                  id: res.body.paddle.businessId,
                }
              : undefined,
          },
          discountId: res.body.paddle.discountId ?? undefined,
          customData: {
            // need to add billingPlanSourceId to customData for paddle webhook
            organizationId: license.organizationId,
            billingPlanSourceId,
          },
        });
      } catch (e) {
        sendErrorNotification('Failed to get purchase data. Please contact us.');
      }
    }
  };

  if (isLoading) {
    return (
      <Box style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingOutlined />
      </Box>
    );
  }

  const promotionCoupon: BillingPromotionCouponResponse | undefined = data?.[0];
  const toFixed = (value: number): number => parseFloat(value.toFixed(2));
  const couponFactor = promotionCoupon ? toFixed(1 - (promotionCoupon.discountPercent ?? 0) / 100) : 1;
  const isDiscounted = couponFactor < 1;
  const isContactUs = selectedValue === CONTACT_US_OPTION_KEY;

  const monthlyPrice = isContactUs
    ? 0
    : isDiscounted
    ? planInfo.optionMap[Number(selectedValue)][currency].monthly.originPrice * couponFactor
    : planInfo.optionMap[Number(selectedValue)][currency].monthly.originPrice;

  return (
    <Box>
      <div>
        <div>
          <PricingTitle>{t(descriptionInfo.titleI18nKey)}</PricingTitle>
        </div>
        {isContactUs ? (
          <Content>Contact us</Content>
        ) : (
          <Content>
            {isDiscounted && (
              <p style={{ color: '#888', textDecoration: 'line-through' }}>
                {getLocaleFormattedPrice(
                  router.locale,
                  currency,
                  isAnnual
                    ? planInfo.optionMap[Number(selectedValue)][currency].yearly.originPrice / 12
                    : planInfo.optionMap[Number(selectedValue)][currency].monthly.originPrice,
                )}
              </p>
            )}
            <PricingPrice>
              {getLocaleFormattedPrice(
                router.locale,
                currency,
                isAnnual ? planInfo.optionMap[Number(selectedValue)][currency].yearly.originPrice / 12 : monthlyPrice,
              )}
            </PricingPrice>
            <PricingPeriod>
              {' / '}
              {t('perMonthText')}
            </PricingPeriod>
            {isAnnual && <div>{`(${t('billedAnnuallyText')})`}</div>}
          </Content>
        )}
        <Content>
          <Select<string | number>
            style={{ width: '100%' }}
            options={options}
            value={selectedValue}
            onChange={handleChangeOption}
            dropdownMatchSelectWidth={false}
          />
        </Content>
        <div>
          {selectedValue === CONTACT_US_OPTION_KEY ? (
            <a href="https://dogutech.io/book-demo" target="_blank">
              <Button type="primary" style={{ width: '100%' }} loading={paddleLoading || precheckoutLoading}>
                {t('contactUs')}
              </Button>
            </a>
          ) : (
            <Button
              type="primary"
              style={{ width: '100%' }}
              onClick={handleClickButton}
              disabled={buttonDisabled}
              loading={paddleLoading || precheckoutLoading}
            >
              {buttonText}
            </Button>
          )}
        </div>
        <Divider />
        <div>
          <ul>
            {descriptionInfo.featureI18nKeys.map((featureKey) => (
              <li key={featureKey}>
                <CheckOutlined style={{ color: '#5cb85c', marginRight: '.25rem' }} />
                {t(featureKey)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Box>
  );
};

export default PlanItem;

const Box = styled.div`
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  line-height: 1.5;
`;

const Content = styled.div`
  margin-bottom: 1rem;
`;

const PricingTitle = styled.b`
  font-size: 1.1rem;
  font-weight: 500;
`;

const PricingPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 600;
`;

const PricingPeriod = styled.span`
  color: #999;
  font-size: 0.9rem;
`;
