import {
  CallBillingApiResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  ValidateBillingCouponDto,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';

import api from '.';
import { buildQueryPraramsByObject } from '../utils/query';

export const validateBillingCoupon = async (
  dto: ValidateBillingCouponDto,
): Promise<CallBillingApiResponse<ValidateBillingCouponResponse>> => {
  const query = buildQueryPraramsByObject(dto);
  const { data } = await api.get<CallBillingApiResponse<ValidateBillingCouponResponse>>(
    `/billing/coupons/validate?${query}`,
  );
  return data;
};

export const purchasePlanWithNewCard = async (
  dto: CreatePurchaseSubscriptionWithNewCardDto,
): Promise<CallBillingApiResponse<CreatePurchaseSubscriptionWithNewCardResponse>> => {
  const { data } = await api.post<CallBillingApiResponse<CreatePurchaseSubscriptionWithNewCardResponse>>(
    '/billing/purchase/new-card',
    dto,
  );
  return data;
};
