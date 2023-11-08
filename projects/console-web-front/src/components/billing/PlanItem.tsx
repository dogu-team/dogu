import { CheckOutlined } from '@ant-design/icons';
import {
  BillingPeriod,
  BillingSubscriptionPlanOptionInfo,
  BillingSubscriptionPlanType,
  CloudLicenseBase,
} from '@dogu-private/console';
import { Button, Divider, Select, SelectProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { PlanDescriptionInfo } from '../../resources/plan';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useLicenseStore from '../../stores/license';
import { getLocaleFormattedPrice } from '../../utils/locale';

interface Props {
  planType: BillingSubscriptionPlanType;
  planInfo: BillingSubscriptionPlanOptionInfo;
  descriptionInfo: PlanDescriptionInfo;
}

const CONTACT_US_OPTION_KEY = 'contact-us';

const PlanItem: React.FC<Props> = ({ planType, planInfo, descriptionInfo }) => {
  const license = useLicenseStore((state) => state.license);
  const [isAnnual, updateIsAnnaul] = useBillingPlanPurchaseStore(
    (state) => [state.isAnnual, state.updateIsAnnual],
    shallow,
  );
  const updateSelectedPlan = useBillingPlanPurchaseStore((state) => state.updateSelectedPlan);
  const { t } = useTranslation('billing');

  const usingPlans = (license as CloudLicenseBase).billingOrganization?.billingSubscriptionPlanInfos;
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
    // TODO: from user's current plan
    return options[0].value;
  });

  const handleChangeOption = (value: string | number) => {
    setSelectedValue(value);
  };

  const getButtonState = (): {
    text: string;
    disabled: boolean;
    shouldGoAnnual: boolean;
  } => {
    const samePlan = usingPlans?.find((plan) => plan.type === planType);
    const period: BillingPeriod = isAnnual ? 'yearly' : 'monthly';

    if (samePlan && samePlan.option === Number(selectedValue) && isAnnual && samePlan.period === 'yearly') {
      return { text: 'Current plan', disabled: true, shouldGoAnnual: false };
    }

    if (samePlan && samePlan.option === Number(selectedValue) && samePlan.period === 'monthly') {
      return { text: t('goAnnualButtonTitle'), disabled: false, shouldGoAnnual: true };
    }

    if (!samePlan || (samePlan && samePlan.period === period && samePlan.option < Number(selectedValue))) {
      return { text: t('upgradeButtonTitle'), disabled: false, shouldGoAnnual: false };
    }

    return { text: t('changeButtonTitle'), disabled: false, shouldGoAnnual: false };
  };

  const { text: buttonText, disabled: buttonDisabled, shouldGoAnnual } = getButtonState();

  const handleClickButton = () => {
    updateSelectedPlan({
      planType,
      option: Number(selectedValue) ?? 0,
      category: planInfo.category,
    });
    if (shouldGoAnnual) {
      updateIsAnnaul(true);
    }
  };

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
            <PricingPrice>
              {getLocaleFormattedPrice(
                'ko',
                'KRW',
                isAnnual
                  ? planInfo.optionMap[Number(selectedValue)].KRW.yearly / 12
                  : planInfo.optionMap[Number(selectedValue)].KRW.monthly,
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
