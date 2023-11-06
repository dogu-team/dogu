import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import { validateBillingCoupon } from '../../api/billing';
import useRequest from '../../hooks/useRequest';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';

interface Props {}

const BillingCouponInput: React.FC<Props> = () => {
  const [couponInputValue, setCouponInputValue] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validateBillingCouponLoading, requestValidateBillingCoupon] = useRequest(validateBillingCoupon);
  const license = useBillingPlanPurchaseStore((state) => state.license);
  const isAnnual = useBillingPlanPurchaseStore((state) => state.isAnnual);
  const [billingCoupon, updateBillingCoupon] = useBillingPlanPurchaseStore(
    (state) => [state.coupon, state.updateCoupon],
    shallow,
  );
  const { t } = useTranslation('billing');

  useEffect(() => {
    useBillingPlanPurchaseStore.subscribe(
      (state) => state.isAnnual,
      () => {
        setCouponInputValue(null);
        setCouponError(null);
      },
    );
  });

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponInputValue(e.target.value);
  };

  const checkCoupon = async () => {
    if (!license?.organizationId || !couponInputValue) {
      return;
    }

    try {
      const rv = await requestValidateBillingCoupon({
        organizationId: license.organizationId,
        code: couponInputValue,
        period: isAnnual ? 'yearly' : 'monthly',
      });

      if (rv.errorMessage || !rv.body?.ok) {
        setCouponError(t('invalidCouponCodeText'));
        updateBillingCoupon(null);
      } else {
        setCouponError(null);
        updateBillingCoupon(couponInputValue);
      }
    } catch (e) {}
  };

  return couponInputValue === null ? (
    <CouponTextButton onClick={() => setCouponInputValue('')}>{t('haveCouponCodeText')}</CouponTextButton>
  ) : (
    <div>
      <Input.Search
        enterButton={<Button>{t('applyCouponButtonText')}</Button>}
        onSearch={checkCoupon}
        value={couponInputValue}
        onChange={handleCouponChange}
        loading={validateBillingCouponLoading}
        placeholder="Code"
      />
      {couponError && (
        <CouponInfoText style={{ color: '#ff0000' }}>
          <CloseCircleOutlined /> {couponError}
        </CouponInfoText>
      )}
      {!!billingCoupon && (
        <CouponInfoText style={{ color: 'green' }}>
          <CheckCircleOutlined /> {t('couponAppliedText')}
        </CouponInfoText>
      )}
    </div>
  );
};

export default BillingCouponInput;

const CouponTextButton = styled.button`
  padding: 0.2rem 0;
  background-color: transparent;
  text-decoration: underline;
  color: ${(props) => props.theme.main.colors.gray3};
  font-size: 0.8rem;
`;

const CouponInfoText = styled.p`
  font-size: 0.7rem;
`;
