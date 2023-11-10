import { CloseOutlined } from '@ant-design/icons';
import {
  BillingPromotionCouponResponse,
  CallBillingApiResponse,
  GetAvailableBillingCouponsDto,
} from '@dogu-private/console';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { shallow } from 'zustand/shallow';

import { swrAuthFetcher } from '../../api';
import useLicenseStore from '../../stores/license';
import usePromotionStore from '../../stores/promotion';
import { buildQueryPraramsByObject } from '../../utils/query';

const PromotionBanner: React.FC = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const { currentPlanType, isPromotionOpenablePage } = usePromotionStore(
    (state) => ({
      currentPlanType: state.currentPlanType,
      isPromotionOpenablePage: state.isPromotionOpenablePage,
    }),
    shallow,
  );
  const license = useLicenseStore((state) => state.license);
  const dto: Omit<GetAvailableBillingCouponsDto, 'type'> = {
    organizationId: license?.organizationId ?? '',
    category: process.env.NEXT_PUBLIC_ENV === 'self-hosted' ? 'self-hosted' : 'cloud',
    subscriptionPlanType: currentPlanType ?? undefined,
  };
  const { data } = useSWR<CallBillingApiResponse<BillingPromotionCouponResponse[]>>(
    isPromotionOpenablePage && `/billing/promotions?${buildQueryPraramsByObject(dto, { removeFalsy: true })}`,
    swrAuthFetcher,
  );

  if (!isPromotionOpenablePage || !isBannerVisible) {
    return null;
  }

  if (data?.errorMessage || !data?.body?.length) {
    return null;
  }

  return (
    <AlertBanner>
      Promotion! {data.body[0].subscriptionPlanType}
      <CloseAlertButton
        onClick={() => {
          localStorage.setItem('hideHeaderBanner', 'true');
          setIsBannerVisible(false);
        }}
      >
        <CloseOutlined />
      </CloseAlertButton>
    </AlertBanner>
  );
};

export default PromotionBanner;

const AlertBanner = styled.div`
  padding: 0.25rem 2rem;
  font-size: 0.85rem;
  background-color: ${(props) => props.theme.main.colors.blue3};
  line-height: 1.5;
  text-align: center;
  color: #fff;

  a {
    color: #76f17e;
    text-decoration: underline;
  }
`;

const CloseAlertButton = styled.button`
  position: absolute;
  padding: 0 0.25rem;
  right: 2rem;
  border-radius: 4px;
  background-color: transparent;

  &:hover {
    background-color: ${(props) => props.theme.main.colors.blue5};
  }
`;
