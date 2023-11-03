import { Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { validateBillingCoupon } from '../../api/billing';
import useRequest from '../../hooks/useRequest';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';

interface Props {}

const BillingCouponInput: React.FC<Props> = () => {
  const [couponInputValue, setCouponInputValue] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validateBillingCouponLoading, requestValidateBillingCoupon] = useRequest(validateBillingCoupon);
  const license = useBillingPlanPurchaseStore((state) => state.license);
  const updateBillingCoupon = useBillingPlanPurchaseStore((state) => state.updateCoupon);

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
      });

      if (rv.errorMessage) {
        setCouponError('Invalid coupon code');
      } else {
        updateBillingCoupon(couponInputValue);
      }
    } catch (e) {}
  };

  return couponInputValue === null ? (
    <CouponTextButton onClick={() => setCouponInputValue('')}>Have a coupon?</CouponTextButton>
  ) : (
    <div>
      <Input.Search
        enterButton={<Button>Apply</Button>}
        onSearch={checkCoupon}
        value={couponInputValue}
        onChange={handleCouponChange}
        loading={validateBillingCouponLoading}
        placeholder="Code"
      />
      {couponError && <CouponErrorText>{couponError}</CouponErrorText>}
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

const CouponErrorText = styled.p`
  color: #ff0000;
  font-size: 0.8rem;
`;
