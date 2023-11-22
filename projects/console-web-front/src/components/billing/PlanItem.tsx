import { CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  BillingCurrency,
  BillingPeriod,
  BillingPromotionCouponResponse,
  BillingSubscriptionPlanOptionInfo,
  BillingSubscriptionPlanType,
} from '@dogu-private/console';
import { Button, Divider, Select, SelectProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { usePromotionCouponSWR } from '../../api/billing';
import { PlanDescriptionInfo } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useLicenseStore from '../../stores/license';
import { getSubscriptionPlansFromLicense } from '../../utils/billing';
import { getLocaleFormattedPrice } from '../../utils/locale';

interface Props {
  planType: BillingSubscriptionPlanType;
  planInfo: BillingSubscriptionPlanOptionInfo;
  descriptionInfo: PlanDescriptionInfo;
}

const CONTACT_US_OPTION_KEY = 'contact-us';

const PlanItem: React.FC<Props> = ({ planType, planInfo, descriptionInfo }) => {
  const license = useLicenseStore((state) => state.license);
  const [isAnnual, updateIsAnnual] = useBillingPlanPurchaseStore(
    (state) => [state.isAnnual, state.updateIsAnnual],
    shallow,
  );
  const updateSelectedPlan = useBillingPlanPurchaseStore((state) => state.updateSelectedPlan);
  const { data, isLoading } = usePromotionCouponSWR(true, {
    subscriptionPlanType: planType,
    category: planInfo.category,
  });
  const router = useRouter();
  const { t } = useTranslation('billing');

  const currency: BillingCurrency = router.locale === 'ko' ? 'KRW' : 'USD';
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

  const handleClickButton = () => {
    updateSelectedPlan({
      type: planType,
      option: Number(selectedValue) ?? 0,
      category: planInfo.category,
    });
    if (shouldGoAnnual) {
      // annual plan is not available for now
      // updateIsAnnual(true);
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
  const couponFactor = promotionCoupon ? toFixed(1 - (promotionCoupon.monthlyDiscountPercent ?? 0) / 100) : 1;
  const isDiscounted = couponFactor < 1;

  const monthlyPrice = isDiscounted
    ? planInfo.optionMap[Number(selectedValue)][currency].monthly * couponFactor
    : planInfo.optionMap[Number(selectedValue)][currency].monthly;

  return (
    <Box>
      <div>
        <div>
          <PricingTitle>{t(descriptionInfo.titleI18nKey)}</PricingTitle>
        </div>
        {selectedValue === CONTACT_US_OPTION_KEY ? (
          <Content>Contact us</Content>
        ) : (
          <Content>
            {isDiscounted && (
              <p style={{ color: '#888', textDecoration: 'line-through' }}>
                {getLocaleFormattedPrice(
                  router.locale,
                  currency,
                  isAnnual
                    ? planInfo.optionMap[Number(selectedValue)][currency].yearly / 12
                    : planInfo.optionMap[Number(selectedValue)][currency].monthly,
                )}
              </p>
            )}
            <PricingPrice>
              {getLocaleFormattedPrice(
                router.locale,
                currency,
                isAnnual ? planInfo.optionMap[Number(selectedValue)][currency].yearly / 12 : monthlyPrice,
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
              <Button type="primary" style={{ width: '100%' }}>
                {t('contactUs')}
              </Button>
            </a>
          ) : (
            <Button type="primary" style={{ width: '100%' }} onClick={handleClickButton} disabled={buttonDisabled}>
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
