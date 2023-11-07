import {
  CallBillingApiResponse,
  CreatePurchaseSubscriptionDto,
  CreatePurchaseSubscriptionResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  UpdateBillingMethodResponse,
  UpdateMethodNiceDto,
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

export const purchasePlanWithExistingCard = async (
  dto: CreatePurchaseSubscriptionDto,
): Promise<CallBillingApiResponse<CreatePurchaseSubscriptionResponse>> => {
  const { data } = await api.post<CallBillingApiResponse<CreatePurchaseSubscriptionResponse>>('/billing/purchase', dto);
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

export const updatePaymentMethod = async (
  dto: UpdateMethodNiceDto,
): Promise<CallBillingApiResponse<UpdateBillingMethodResponse>> => {
  const { data } = await api.put<CallBillingApiResponse<UpdateBillingMethodResponse>>('/billing/methods', dto);
  return data;
};
