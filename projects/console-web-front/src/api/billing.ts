import {
  CallBillingApiResponse,
  CreatePurchaseSubscriptionWithNewCardDto,
  CreatePurchaseSubscriptionWithNewCardResponse,
  FindBillingMethodDto,
  FindBillingMethodResponse,
  UpdateBillingMethodResponse,
  UpdateMethodNiceDto,
  ValidateBillingCouponDto,
  ValidateBillingCouponResponse,
} from '@dogu-private/console';
import { GetServerSidePropsContext } from 'next';

import api from '.';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../utils/auth';
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

export const updatePaymentMethod = async (
  dto: UpdateMethodNiceDto,
): Promise<CallBillingApiResponse<UpdateBillingMethodResponse>> => {
  const { data } = await api.put<CallBillingApiResponse<UpdateBillingMethodResponse>>('/billing/methods', dto);
  return data;
};

export const getPaymentMethodsInServerSide = async (
  context: GetServerSidePropsContext,
  dto: FindBillingMethodDto,
): Promise<CallBillingApiResponse<FindBillingMethodResponse>> => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const query = buildQueryPraramsByObject(dto);
    const response = await api.get<CallBillingApiResponse<FindBillingMethodResponse>>(`/billing/methods?${query}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setCookiesInServerSide(response, context);
    return response.data;
  }

  throw new EmptyTokenError();
};
